import { useRef, useState } from "react";
import { useIsomorphicEffect } from "./use-isomorphic-effect";

export const useResizeable = () => {
	const [innerHeight, setInnerHeight] = useState<number>();
	const [width, setWidth] = useState<number>();
	const [innerWidth, setInnerWidth] = useState<number>();
	const isInitialMount = useRef(true);

	useIsomorphicEffect(() => {
		let timer: any;

		const handler = () => {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				setInnerWidth(window.innerWidth);
				setInnerHeight(window.innerHeight);
				if (window.innerWidth * 0.75 < width!) {
					setWidth(window.innerWidth * 0.75);
				}
			}, 100);
		};

		if (isInitialMount.current) {
			handler();
			setWidth(window.innerWidth);
		}

		isInitialMount.current = false;

		window.addEventListener("resize", handler);

		return () => window.removeEventListener("resize", handler);
	}, [width]);

	return { innerHeight, innerWidth, width, setWidth };
};
