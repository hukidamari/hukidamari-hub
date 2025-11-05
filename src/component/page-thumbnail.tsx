import Image from "next/image";

const PageThumbnail = ({
  alt,
  src,
  width = 1200,
  height = 630,
}: {
  alt: string;
  src: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        objectFit: "contain",
        width: "100%",
        height: "auto",
      }}
    />
  );
};

export default PageThumbnail;
