import { readable } from "svelte/store";

export interface OrientationAxes {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface RawOrientationAxes {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export interface OrientationReading {
  absolute: RawOrientationAxes;
  relative: OrientationAxes;
}

const getRawOrientation = (event?: DeviceOrientationEvent): RawOrientationAxes => {
  if (!event) {
    return { alpha: 0, beta: 0, gamma: 0 };
  }
  return {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma,
  };
};

const getOrientationObject = (event?: DeviceOrientationEvent): OrientationReading => {
  const orientation = getRawOrientation(event);
  return {
    absolute: orientation,
    relative: {
      alpha: (orientation.alpha ?? 0) - (baseOrientation.alpha ?? 0),
      beta: (orientation.beta ?? 0) - (baseOrientation.beta ?? 0),
      gamma: (orientation.gamma ?? 0) - (baseOrientation.gamma ?? 0),
    }
  }
};

let firstReading = true;
let baseOrientation = getRawOrientation();

export const resetBaseOrientation = () => {
  firstReading = true;
  baseOrientation = getRawOrientation();
};

export const orientation = readable(getOrientationObject(), function start(set) {

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
  const handleOrientation = (event: DeviceOrientationEvent) => {

    if ( firstReading ) {
      firstReading = false;
      baseOrientation = getRawOrientation(event);
    }

    const o = getOrientationObject(event);
    set( o );
  };

  window.addEventListener("deviceorientation", handleOrientation, true);

  return function stop() {
    window.removeEventListener("deviceorientation", handleOrientation, true);
  };

});
