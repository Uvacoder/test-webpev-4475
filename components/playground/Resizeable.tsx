import { ResizableBox } from "react-resizable";
import { ResizableProps } from "../../typings/interfaces";
import { useResizeable } from "../../utils/hooks/use-resizeable";

export const Resizeable: React.FC<ResizableProps> = ({ direction, children }) => {
	let resizableProps: ResizableProps = {};

	const { width, innerHeight, innerWidth, setWidth } = useResizeable();

	if (!innerHeight || !innerWidth) return null;

	if (direction === "horizontal") {
		resizableProps = {
			className: "resize-horizontal",
			minConstraints: [innerWidth! * 0.2, Infinity],
			maxConstraints: [innerWidth! * 0.75, Infinity],
			height: Infinity,
			width,
			resizeHandles: ["e"],
			onResizeStop: (e, data) => {
				setWidth(data.size.width);
			},
		};
	} else {
		resizableProps = {
			minConstraints: [Infinity, 24],
			lockAspectRatio: true,
			maxConstraints: [Infinity, innerWidth * 0.74],
			height: innerHeight - 20,
			width: Infinity,
			resizeHandles: ["s"],
		};
	}

	return (
		//@ts-ignore
		<ResizableBox {...resizableProps}>
			<div className="flex flex-grow w-full h-full">{children}</div>
		</ResizableBox>
	);
};