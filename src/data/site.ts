export const business = {
  name: "Dhuraj Interiors",
  shortName: "Dhuraj",
  tagline: "Interior design & custom woodwork",
  description:
    "Interior design, modular kitchens, wardrobes and custom woodwork, designed and built in Thanjavur since 1987.",
  phone: "+91 73737 30340",
  phoneHref: "tel:+917373730340",
  whatsapp: "917373730340",
  email: "dhurajinteriors16@gmail.com",
  address: "1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613 004",
  locality: "Thanjavur, Tamil Nadu",
  hours: "Mon–Sat, 8 AM–8 PM · Sun, 8 AM–5 PM",
  serviceAreas: "Thanjavur · Trichy · Mannargudi · Pudukkottai",
  founded: "1987",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Dhuraj Interiors, 1243 Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613004"),
  mapEmbed:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Dhuraj Interiors, 1243 Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613004") +
    "&z=15&output=embed",
} as const;

/**
 * Every photo on the site is referenced from here.
 * To swap an image, either replace the file in `public/images/` or change the
 * path below — no component needs editing.
 */
export const images = {
  hero: "/images/hero.webp",
  aboutStudio: "/images/about-studio.webp",
  courtyard: "/images/gallery-courtyard.jpg",
  living: "/images/lounge.jpg",
  kitchen: "/images/gallery-kitchen.jpg",
  wardrobe: "/images/gallery-wardrobe.jpg",
  flooring: "/images/living.jpg",
  colour: "/images/gallery-yellow.jpg",
  woodwork: "/images/craft.jpg",
  finishes: "/images/gallery-green.jpg",
  ceiling: "/images/service-ceiling.jpg",
  netlon: "/images/service-netlon.jpg",
} as const;

export type NavItem = { label: string; href: string };

/**
 * Web3Forms access key used by the enquiry form. Keys are meant to sit in
 * client-side code — restrict this key to the site's domain in the Web3Forms
 * dashboard so nobody else can post enquiries with it.
 */
export const web3formsAccessKey = "b7fd1cf9-8493-4441-9878-48b0c8bdd129";

export const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export type Service = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const services: Service[] = [
  {
    title: "Modular kitchens",
    description: "Bespoke kitchens planned around how you cook, with practical, hard-wearing finishes.",
    image: images.kitchen,
    imageAlt: "Fitted kitchen with handleless cabinetry and a work island",
  },
  {
    title: "Wardrobes & storage",
    description: "Fitted wardrobes that make the most of every wall, corner and ceiling height.",
    image: images.wardrobe,
    imageAlt: "Built-in wardrobe with glass-panel doors in a bright bedroom",
  },
  {
    title: "Wooden flooring",
    description: "Warm, hard-wearing wooden floors, supplied and laid to last.",
    image: images.flooring,
    imageAlt: "Living room with timber flooring and panelled joinery",
  },
  {
    title: "False ceilings",
    description:
      "Clean ceiling lines, cove lighting and concealed services, detailed to suit the room.",
    image: images.ceiling,
    imageAlt: "Living room with a coffered false ceiling and recessed lighting",
  },
  {
    title: "Mosquito netlon",
    description:
      "Made-to-measure netlon for windows and doors — effective, neat and easy to live with.",
    image: images.netlon,
    imageAlt: "Window screen framing a sunset over the rooftops",
  },
  {
    title: "Custom woodwork",
    description:
      "Bespoke furniture, panelling and joinery, made in our workshop and fitted on site.",
    image: images.woodwork,
    imageAlt: "Craftsperson turning a piece of timber on a lathe",
  },
];

export const stats = [
  { value: "1987", label: "Established in Thanjavur" },
  { value: "35+", label: "Years of craftsmanship" },
  { value: "5-year", label: "Workmanship warranty" },
  { value: "60-day", label: "Typical project completion" },
];

export type Strength = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: "award" | "layers" | "shield" | "clock" | "refresh" | "sparkle";
};

export const strengths: Strength[] = [
  {
    title: "Crafting interiors since 1987",
    description:
      "Founded by Dhurai Raj, our studio has shaped homes across the region for more than three decades.",
    image: images.aboutStudio,
    imageAlt: "Softly lit interior with a lounge chair, side table and timber floor",
    icon: "award",
  },
  {
    title: "One team, start to finish",
    description:
      "Design, woodwork and installation are handled in-house, so what you approve is what you get.",
    image: images.woodwork,
    imageAlt: "Craftsperson turning a piece of timber on a lathe",
    icon: "layers",
  },
  {
    title: "Materials chosen to last",
    description:
      "We choose boards, finishes and fittings for daily life in Tamil Nadu's climate, not just for photos.",
    image: images.finishes,
    imageAlt: "Living room with a patterned green wall, timber floor and planting",
    icon: "shield",
  },
  {
    title: "A five-year warranty",
    description: "Our workmanship is covered for five years — we stand behind how we build.",
    image: images.wardrobe,
    imageAlt: "Built-in wardrobe with glass-panel doors in a bright bedroom",
    icon: "clock",
  },
  {
    title: "Completed in about 60 days",
    description:
      "Most projects are finished within 60 days, with a schedule agreed before work begins.",
    image: images.kitchen,
    imageAlt: "Fitted kitchen with handleless cabinetry and a work island",
    icon: "refresh",
  },
  {
    title: "Support long after handover",
    description:
      "Need an adjustment years later? Call the same team that built your interiors.",
    image: images.living,
    imageAlt: "Warm living room with timber flooring, leather seating and tall windows",
    icon: "sparkle",
  },
];

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
};

export const gallery: GalleryItem[] = [
  {
    src: images.living,
    alt: "Warm living room with timber flooring, leather seating and tall windows",
    caption: "Living & lounge",
  },
  {
    src: images.kitchen,
    alt: "Fitted kitchen with handleless cabinetry and a work island",
    caption: "Modular kitchens",
  },
  {
    src: images.wardrobe,
    alt: "Built-in wardrobe with glass-panel doors in a bright bedroom",
    caption: "Wardrobes & storage",
  },
  {
    src: images.flooring,
    alt: "Living room with timber flooring and panelled joinery",
    caption: "Wooden flooring & joinery",
  },
  {
    src: images.colour,
    alt: "Living room with a yellow sofa, green wall and layered textiles",
    caption: "Colour & material",
  },
  {
    src: images.woodwork,
    alt: "Craftsperson turning a piece of timber on a lathe",
    caption: "Custom woodwork",
  },
  {
    src: images.courtyard,
    alt: "Warm entry courtyard with terracotta flooring, timber doors and a bench",
    caption: "Entrances & courtyards",
  },
  {
    src: images.finishes,
    alt: "Living room with a patterned green wall, timber floor and planting",
    caption: "Finishes & texture",
  },
];

export type Testimonial = {
  name: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Anandh",
    quote:
      "Dhuraj Interior exceeded my expectations with their exceptional design expertise. The team's attention to detail and commitment to quality transformed my space into a true masterpiece.",
  },
  {
    name: "Sebastin",
    quote:
      "I hired Dhuraj Interior for wardrobe services. They brought my vision to life with a personalised approach and creative solutions.",
  },
  {
    name: "Malini",
    quote:
      "I recently availed Dhuraj Interior's mosquito netlon service and I am happy with the results. The team's expertise is truly commendable.",
  },
];

export const enquiryTypes = [
  "Full home interior",
  "Modular kitchens",
  "Wardrobes & storage",
  "Wooden flooring",
  "False ceilings",
  "Mosquito netlon",
  "Custom woodwork",
  "Something else",
] as const;

export const budgetOptions = [
  "Not decided yet",
  "Under ₹2 lakh",
  "₹2–5 lakh",
  "₹5–10 lakh",
  "₹10–20 lakh",
  "Above ₹20 lakh",
] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}
