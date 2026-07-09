"use client";

import { useEffect, useState } from "react";
import type { MovementInput } from "./movement";

const initialInput: MovementInput = {
  forward: false,
  backward: false,
  left: false,
  nitro: false,
  right: false,
};

function mapKeyToDirection(key: string): keyof MovementInput | null {
  switch (key.toLowerCase()) {
    case "w":
    case "arrowup":
      return "forward";
    case "s":
    case "arrowdown":
      return "backward";
    case "a":
    case "arrowleft":
      return "left";
    case "d":
    case "arrowright":
      return "right";
    case " ":
      return "nitro";
    default:
      return null;
  }
}

export function useKeyboardControls() {
  const [input, setInput] = useState<MovementInput>(initialInput);

  useEffect(() => {
    function setDirection(event: KeyboardEvent, pressed: boolean) {
      const direction = mapKeyToDirection(event.key);

      if (!direction) {
        return;
      }

      event.preventDefault();
      setInput((current) => ({ ...current, [direction]: pressed }));
    }

    function handleKeyDown(event: KeyboardEvent) {
      setDirection(event, true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      setDirection(event, false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return input;
}
