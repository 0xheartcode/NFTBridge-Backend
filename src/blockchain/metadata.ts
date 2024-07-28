// src/blockchain/metadata.ts

interface Tier {
  name: string;
  image: string;
  external_url: string;
  description: string;
}

interface TiersType {
  [key: string]: Tier;
}

const Tiers:TiersType = {
  "0": {
    name: "Mediathree",
    image: "/meta/images/mediathree.png",
    external_url: "/meta/videos/mediathree.mp4",
    description: "Mediathree Tier NetworkNFT",
  },
  "1": {
    name: "Mediafour",
    image: "/meta/images/mediafour.png",
    external_url: "/meta/videos/mediafour.mp4",
    description: "Mediafour Tier NetworkNFT",
  },
  "2": {
    name: "Mediatwo",
    image: "/meta/images/mediatwo.png",
    external_url: "/meta/videos/mediatwo.mp4",
    description: "Mediatwo Tier NetworkNFT",
  },
  "3": {
    name: "Mediaone",
    image: "/meta/images/mediaone.png",
    external_url: "/meta/videos/mediaone.mp4",
    description: "Mediaone Tier NetworkNFT",
  },
};

interface Metadata {
  description: string;
  external_url: string;
  image: string;
  name: string;
}

export function getMetadata(tokenId: string, baseUrl: string): Metadata {
  const tier = Tiers[tokenId];
  if (!tier) {
    return {
      description: '',
      external_url: '',
      image: '',
      name: '',
    };
  }
  return {
    description: tier.description,
    external_url: `${baseUrl}${tier.image}`,
    image: `${baseUrl}${tier.external_url}`,
    name: tier.name,
  };
}
