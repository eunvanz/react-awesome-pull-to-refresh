import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import "./PullToRefreshForNoBounce.scss";
import CONST from "./constants";

const DEFAULT_TARGET_MARGIN_TRANSITION = "margin 0.25s cubic-bezier(0, 0, 0, 1)";

export interface CommonPullToRefreshProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  targetRef: React.RefObject<HTMLElement>;
  originTop?: number; // top of target where pullToRefresh starts (based on clientRects)
  originMarginTop?: number;
  triggerHeight?: number; // The height at which pullToRefresh is triggered
  progressHeight?: number; // height to keep during refresh
  onRefresh: VoidFunction;
  refreshDelay?: number;
  isRefreshing: boolean;
  spinnerSize?: number;
  customSpinner?: React.ReactNode;
  onReachTriggerHeight?: VoidFunction;
  onPull?: (progress: number) => void; // progress is 0 to 1
  onRelease?: VoidFunction;
}

export interface PullToRefreshForNoBounceProps extends CommonPullToRefreshProps {
  tension?: number;
}

const PullToRefreshForNoBounce = ({
  targetRef,
  originTop = 0,
  originMarginTop = 0,
  triggerHeight = 80,
  progressHeight = 50,
  onRefresh,
  refreshDelay = 0,
  isRefreshing,
  style,
  tension = 0.8,
  className,
  spinnerSize = CONST.SPINNER_SIZE,
  customSpinner,
  onReachTriggerHeight,
  onPull,
  onRelease,
  ...restProps
}: PullToRefreshForNoBounceProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const spinnerRef = useRef<HTMLImageElement | null>(null);
  const touchStartRef = useRef<number>(0);
  const isDisabledRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const touchStartFuncRef = useRef<(e: TouchEvent) => void>(() => {});
  const touchMoveFuncRef = useRef<(e: TouchEvent) => void>(() => {});
  const touchEndFuncRef = useRef<(e: TouchEvent) => void>(() => {});

  const [initialized, setInitialized] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const resetHeightToDOM = useCallback(() => {
    onRelease?.();
    const pullToRefreshDOM = wrapperRef.current;
    const targetDOM = targetRef.current;
    if (pullToRefreshDOM) {
      pullToRefreshDOM.classList.add("transition-enabled");
      pullToRefreshDOM.style.opacity = "0";
      setTimeout(() => {
        pullToRefreshDOM.classList.remove("transition-enabled");
        isRefreshingRef.current = isRefreshing;
      }, CONST.TRANSITION_DURATION);
    }
    if (targetDOM) {
      targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      targetDOM.style.marginTop = `${originMarginTop}px`;
      setTimeout(() => {
        targetDOM.style.transition = "none";
      }, CONST.TRANSITION_DURATION);
    }
  }, [isRefreshing, originMarginTop, targetRef]);

  const refresh = useCallback(() => {
    onRelease?.();
    const targetDOM = targetRef.current;
    if (targetDOM) {
      targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      targetDOM.style.marginTop = `${progressHeight + originMarginTop}px`;
    }
    const pullToRefreshDOM = wrapperRef.current;
    if (pullToRefreshDOM) {
      isRefreshingRef.current = true;
      setShouldRefresh(false);
      setTimeout(onRefresh, refreshDelay);
    }
  }, [targetRef, progressHeight, originMarginTop, onRefresh, refreshDelay]);

  const checkOffsetPosition = useCallback(() => {
    isDisabledRef.current = window.scrollY > originTop;
  }, [originTop]);

  const checkConditionAndRun = useCallback(
    (conditionFn, fn) => {
      checkOffsetPosition();
      if (!conditionFn()) {
        fn();
      }
    },
    [checkOffsetPosition],
  );

  const showSpinner = useCallback(
    (height: number) => {
      const pullToRefreshDOM = wrapperRef.current;
      const targetDOM = targetRef.current;
      const spinnerDOM = spinnerRef.current;

      if (pullToRefreshDOM && targetDOM) {
        targetDOM.style.marginTop = `${height + originMarginTop}px`;
        if (height <= triggerHeight) {
          setShouldRefresh(false);
          const progress = height / triggerHeight;
          onPull?.(progress);
          if (spinnerDOM) {
            pullToRefreshDOM.style.opacity = `${height / triggerHeight}`;
            const rotate = `rotate(${
              (height / triggerHeight) * CONST.SPINNER_SPIN_DEGREE
            }deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.remove("bump");
          }
        } else {
          onReachTriggerHeight?.();
          onPull?.(1);
          setShouldRefresh(true);
          if (spinnerDOM) {
            const rotate = `rotate(${CONST.SPINNER_SPIN_DEGREE}deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.add("bump");
          }
        }
      }
    },
    [originMarginTop, targetRef, triggerHeight],
  );

  const handleOnTouchMove = useCallback(
    (e) => {
      const height = e.touches[0].clientY - touchStartRef.current;
      if (height <= 0 || isNaN(height)) {
        return;
      }
      const poweredHeight = Math.pow(height, tension);
      showSpinner(poweredHeight);
    },
    [showSpinner],
  );

  const setTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  useEffect(() => {
    touchStartFuncRef.current = (e) => {
      checkConditionAndRun(
        () => isRefreshingRef.current || isDisabledRef.current || isRefreshing,
        () => setTouchStart(e),
      );
    };
    touchMoveFuncRef.current = (e: TouchEvent) => {
      checkConditionAndRun(
        () => isDisabledRef.current || isRefreshing || isRefreshingRef.current,
        () => handleOnTouchMove(e),
      );
    };
    touchEndFuncRef.current =
      shouldRefresh && !isRefreshingRef.current
        ? refresh
        : isRefreshing
        ? () => {}
        : resetHeightToDOM;
    const targetDOM = targetRef.current;
    if (targetDOM) {
      targetDOM.addEventListener("touchstart", touchStartFuncRef.current);
      targetDOM.addEventListener("touchmove", touchMoveFuncRef.current);
      targetDOM.addEventListener("touchend", touchEndFuncRef.current);
      return () => {
        targetDOM.removeEventListener("touchstart", touchStartFuncRef.current);
        targetDOM.removeEventListener("touchmove", touchMoveFuncRef.current);
        targetDOM.removeEventListener("touchend", touchEndFuncRef.current);
      };
    }
  }, [
    checkConditionAndRun,
    resetHeightToDOM,
    showSpinner,
    handleOnTouchMove,
    shouldRefresh,
    refresh,
    isRefreshing,
    targetRef,
  ]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
    if (!isRefreshing) {
      resetHeightToDOM();
    }
  }, [isRefreshing, resetHeightToDOM]);

  useEffect(() => {
    const pullToRefreshDOM = wrapperRef.current;
    if (!initialized) {
      if (isRefreshing) {
        showSpinner(triggerHeight);
        if (pullToRefreshDOM) {
          pullToRefreshDOM.style.height = `${triggerHeight}px`;
        }
      }
      setInitialized(true);
    }
  }, [initialized, isRefreshing, triggerHeight, showSpinner]);

  return (
    <div
      className={classNames("react-awesome-ptr", "for-no-bounce", className)}
      ref={wrapperRef}
      {...restProps}
      style={{ ...style, top: originTop }}
    >
      {customSpinner || (
        <div
          className="spinner"
          style={{
            marginTop: (progressHeight - spinnerSize) / 2,
            width: spinnerSize,
          }}
        >
          <img
            alt=""
            className={classNames({ spin: isRefreshing })}
            ref={spinnerRef}
            src={CONST.SPINNER_IMG_URL}
          />
        </div>
      )}
    </div>
  );
};

export default PullToRefreshForNoBounce;
