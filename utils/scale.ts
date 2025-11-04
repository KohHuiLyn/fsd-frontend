import { Dimensions, PixelRatio } from "react-native"

// Base sizes reference (iPhone 11-ish). Adjust if your primary design uses another size
const BASE_WIDTH = 375
const BASE_HEIGHT = 812

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

export const horizontalScale = (size: number): number => {
	return (SCREEN_WIDTH / BASE_WIDTH) * size
}

export const verticalScale = (size: number): number => {
	return (SCREEN_HEIGHT / BASE_HEIGHT) * size
}

// For fonts/margins that shouldn't scale linearly; factor typically 0.5-0.7
export const moderateScale = (size: number, factor = 0.6): number => {
	const scaled = size * (SCREEN_WIDTH / BASE_WIDTH)
	return size + (scaled - size) * factor
}

export const scaleFont = (size: number): number => {
	return PixelRatio.roundToNearestPixel(moderateScale(size))
}

export type ScaleFn = (size: number) => number


