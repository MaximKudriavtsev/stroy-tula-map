/**
 * Isochrone state hook.
 *
 * Manages loading / error / ready states and exposes the selected time
 * together with the style object used for the YMapFeature.
 */

import { useEffect, useRef, useState } from "react";

import {
  fetchIsochrone,
  type IsochroneResult,
  type IsochroneResponse,
} from "@/lib/isochrone-api";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type IsochroneState =
  | { status: "idle" }
  | { status: "loading"; data?: IsochroneResult }
  | { status: "error"; message: string; data?: IsochroneResult }
  | { status: "ready"; data: IsochroneResult };

export const ISOCHRONE_TIMES = [5, 10, 15, 30] as const;
export type IsochroneTime = (typeof ISOCHRONE_TIMES)[number];

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

export const ISOCHRONE_STYLE: Record<string, unknown> = {
  fill: "rgba(184, 74, 57, 0.25)",
  stroke: [{ width: 3, color: "#B84A39", opacity: 0.8 }],
  simplificationRate: 0,
  interactive: false,
  zIndex: 2,
};

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useIsochrone(
  longitude: number | null,
  latitude: number | null,
  municipality?: string,
  timeMinutes?: IsochroneTime,
) {
  const [state, setState] = useState<IsochroneState>({ status: "idle" });
  const previousDataRef = useRef<IsochroneResult | undefined>(undefined);

  // Reset when coordinates change (new object selected).
  useEffect(() => {
    previousDataRef.current = undefined;
    setState({ status: "idle" });
  }, [longitude, latitude]);

  // Fetch isochrone when coordinates are valid.
  useEffect(() => {
    if (longitude === null || latitude === null) {
      previousDataRef.current = undefined;
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState((prev) => ({
      status: "loading",
      data:
        prev.status === "ready" || prev.status === "loading"
          ? prev.data
          : previousDataRef.current,
    }));

    void (async () => {
      const result: IsochroneResponse = await fetchIsochrone(
        longitude,
        latitude,
        timeMinutes ?? 10,
        municipality,
      );

      if (cancelled) return;

      if (result.ok) {
        previousDataRef.current = result.data;
        setState({ status: "ready", data: result.data });
      } else {
        setState({
          status: "error",
          message: result.error.message,
          data: previousDataRef.current,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [longitude, latitude, timeMinutes, municipality]);

  const hasActiveIsochrone =
    state.status === "ready" ||
    state.status === "loading" ||
    (state.status === "error" && state.data != null);

  return {
    state,
    hasActiveIsochrone,
    isoStyle: ISOCHRONE_STYLE,
  };
}
