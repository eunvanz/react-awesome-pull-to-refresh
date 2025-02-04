import { ComponentMeta } from "@storybook/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PullToRefreshState } from "./CommonPullToRefresh";
import CupertinoSpinner from "./CupertinoSpinner";

import PullToRefresh from "./PullToRefresh";

export default {
  title: "PullToRefresh",
  component: PullToRefresh,
} as ComponentMeta<typeof PullToRefresh>;

export const OnTheTop: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [releaseCnt, setReleaseCnt] = useState(0);
  const [refreshCnt, setRefreshCnt] = useState(0);
  const [pullToRefreshState, setPullToRefreshState] = useState<PullToRefreshState>(
    "idle",
  );

  const onRefresh = useCallback(() => {
    setRefreshCnt((cnt) => ++cnt);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onRelease = useCallback(() => {
    setReleaseCnt((cnt) => ++cnt);
  }, []);

  const onChangeState = useCallback((state: PullToRefreshState) => {
    setPullToRefreshState(state);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onRelease={onRelease}
        onChangeState={onChangeState}
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser</p>
        <p>onPull: passed progress is {progress}</p>
        <p>onRelease: called {releaseCnt} times</p>
        <p>onRefresh: called {refreshCnt} times</p>
        <p>state: {pullToRefreshState}</p>
      </div>
    </>
  );
};

export const WithHeader: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  return (
    <>
      <div
        style={{
          height: 60,
          background: "cyan",
          padding: 20,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1,
        }}
      >
        Header
      </div>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        originTop={100}
        originMarginTop={100}
        hasDefaultPullToRefreshPossibly
      />
      <div
        style={{ height: "100vh", background: "pink", padding: 20, marginTop: 100 }}
        ref={targetRef}
      >
        Pull in a mobile browser
      </div>
    </>
  );
};

export const ArtificialBounce: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isBounceNotSupported
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser (forced artificial bounce)
      </div>
    </>
  );
};

export const CustomSpinner: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [pullToRefreshState, setPullToRefreshState] = useState("idle");

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onChangeState = useCallback((state: PullToRefreshState) => {
    setPullToRefreshState(state);
  }, []);

  const customSpinner = useMemo(() => {
    return (
      <div style={{ textAlign: "center", marginTop: 15 }}>
        {pullToRefreshState === "triggerReady"
          ? "⬆️ Release"
          : pullToRefreshState === "refreshing"
          ? "Refreshing..."
          : pullToRefreshState === "complete"
          ? "Complete"
          : `⬇️ Pull to refresh (${(progress * 100).toFixed()}%)`}
      </div>
    );
  }, [pullToRefreshState, isRefreshing, progress]);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onChangeState={onChangeState}
        customSpinner={customSpinner}
        completeDelay={500}
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (custom spinner)</p>
      </div>
    </>
  );
};

export const CupertinoSpinnerAsCustomSpinner: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [pullToRefreshState, setPullToRefreshState] = useState<PullToRefreshState>(
    "idle",
  );

  const { isTriggerReady, isComplete } = useMemo(() => {
    return {
      isTriggerReady: pullToRefreshState === "triggerReady",
      isComplete: pullToRefreshState === "complete",
    };
  }, [pullToRefreshState]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onChangeState = useCallback((state: PullToRefreshState) => {
    setPullToRefreshState(state);
  }, []);

  const customSpinner = useMemo(() => {
    return (
      <CupertinoSpinner
        progress={progress}
        isRefreshing={isRefreshing}
        isTriggerReady={isTriggerReady}
        isComplete={isComplete}
      />
    );
  }, [pullToRefreshState, progress, isRefreshing, isTriggerReady, isComplete]);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onChangeState={onChangeState}
        customSpinner={customSpinner}
        hasDefaultPullToRefreshPossibly
        isOpacityChangeOnPullDisabled
        isRotationSpinnerOnPullDisabled
        completeDelay={200}
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (CupertinoSpinner as custom spinner)</p>
      </div>
    </>
  );
};

export const HiddenSpinnerDuringRefreshing: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isSpinnerHiddenDuringRefreshing
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (hidden spinner during refreshing)</p>
        <p>{isRefreshing ? "Refreshing..." : ""}</p>
      </div>
    </>
  );
};

export const InitiallyRefreshingWithHiddenSpinner: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(true);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isSpinnerHiddenDuringRefreshing
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (hidden spinner during refreshing)</p>
        <p>{isRefreshing ? "Refreshing..." : ""}</p>
      </div>
    </>
  );
};

export const DarkMode: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const originBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#000";
    return () => {
      document.body.style.backgroundColor = originBackgroundColor;
    };
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isDarkMode
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser (dark mode)
      </div>
    </>
  );
};
