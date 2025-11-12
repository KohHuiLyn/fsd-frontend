declare module "expo-image-manipulator" {
  export enum SaveFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
    HEIC = "heic",
    TIFF = "tiff",
  }

  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export interface ManipulateOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export function manipulateAsync(
    uri: string,
    actions: any[],
    options?: ManipulateOptions
  ): Promise<ImageResult>;
}

