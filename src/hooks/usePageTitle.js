import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = `打卡应用｜${title}`;
  }, [title]);
};

export default usePageTitle;
