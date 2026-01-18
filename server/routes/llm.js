import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

// In-memory task storage
const tasks = new Map();

// Task expiration time (1 hour)
const TASK_EXPIRY_MS = 60 * 60 * 1000;

// Clean up expired tasks periodically
setInterval(() => {
  const now = Date.now();
  for (const [taskId, task] of tasks.entries()) {
    if (now - task.createdAt > TASK_EXPIRY_MS) {
      tasks.delete(taskId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Helper function to call Gemini API
async function callGeminiAPI(messages, systemPrompt) {
  const apiUrl = process.env.GEMINI_API_URL;
  const apiKey = process.env.GEMINI_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const defaultSystemPrompt = process.env.LLM_SYSTEM_PROMPT || 'You are a helpful assistant.';

  if (!apiUrl || !apiKey) {
    throw new Error('GEMINI_API_URL and GEMINI_KEY must be configured in .env');
  }

  // Build messages array with system prompt
  const fullMessages = [
    { role: 'system', content: systemPrompt || defaultSystemPrompt },
    ...messages
  ];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: fullMessages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Extract content from OpenAI-compatible response format
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    model
  };
}

// Process async task (for poll and callback modes)
async function processAsyncTask(taskId, messages, systemPrompt, callbackUrl) {
  try {
    const result = await callGeminiAPI(messages, systemPrompt);

    // Update task status
    const task = tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.data = result;
      task.completedAt = Date.now();
    }

    // Send callback if URL provided
    if (callbackUrl) {
      try {
        await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taskId,
            status: 'completed',
            data: result
          })
        });
      } catch (callbackError) {
        console.error(`Callback failed for task ${taskId}:`, callbackError.message);
      }
    }
  } catch (error) {
    // Update task with error status
    const task = tasks.get(taskId);
    if (task) {
      task.status = 'error';
      task.error = error.message;
      task.completedAt = Date.now();
    }

    // Send error callback if URL provided
    if (callbackUrl) {
      try {
        await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taskId,
            status: 'error',
            error: error.message
          })
        });
      } catch (callbackError) {
        console.error(`Error callback failed for task ${taskId}:`, callbackError.message);
      }
    }
  }
}

// POST /api/llm/chat - Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt, mode = 'sync', callbackUrl } = req.body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messages is required and must be a non-empty array'
      });
    }

    // Validate callback mode
    if (mode === 'callback' && !callbackUrl) {
      return res.status(400).json({
        success: false,
        error: 'callbackUrl is required when mode is "callback"'
      });
    }

    // Handle sync mode - wait for response
    if (mode === 'sync') {
      const result = await callGeminiAPI(messages, systemPrompt);
      return res.json({
        success: true,
        data: result
      });
    }

    // Handle poll and callback modes - async processing
    const taskId = randomUUID();

    // Create task record
    tasks.set(taskId, {
      taskId,
      status: 'pending',
      createdAt: Date.now(),
      messages,
      systemPrompt
    });

    // Start async processing (don't await)
    processAsyncTask(taskId, messages, systemPrompt, mode === 'callback' ? callbackUrl : null);

    // Return task info
    if (mode === 'poll') {
      return res.json({
        success: true,
        taskId,
        status: 'pending',
        pollUrl: `/api/llm/task/${taskId}`
      });
    }

    // mode === 'callback'
    return res.json({
      success: true,
      taskId,
      status: 'pending',
      message: 'Will callback to provided URL when complete'
    });

  } catch (error) {
    console.error('LLM chat error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/llm/task/:taskId - Poll for task result
router.get('/task/:taskId', (req, res) => {
  const { taskId } = req.params;

  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  // Return based on status
  if (task.status === 'pending') {
    return res.json({
      taskId: task.taskId,
      status: 'pending'
    });
  }

  if (task.status === 'completed') {
    return res.json({
      taskId: task.taskId,
      status: 'completed',
      data: task.data
    });
  }

  if (task.status === 'error') {
    return res.json({
      taskId: task.taskId,
      status: 'error',
      error: task.error
    });
  }
});

export default router;
