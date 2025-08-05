import Image from "next/image";

interface ArtworkProof {
  id: string;
  src: string;
  alt: string;
}

interface ArtworkProofsProps {
  artworkProofs: ArtworkProof[];
}

const ArtworkProofs = ({ artworkProofs }: ArtworkProofsProps) => {
  if (artworkProofs.length === 0) return null;

  return (
    <div className="print:page-break-after-always space-y-4">
      <h4 className="font-semibold">Artwork</h4>
      <div className="flex gap-4 overflow-x-auto">
        {artworkProofs.map((proof) => (
          <Image
            key={proof.id}
            src={proof.src}
            alt={proof.alt}
            className="h-40 w-auto rounded-md"
            unoptimized
            width={100}
            height={100}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtworkProofs;
