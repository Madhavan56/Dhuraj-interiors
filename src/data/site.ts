export const business = {
  name: "Dhuraj Interiors",
  shortName: "Dhuraj",
  tagline: "Interior design & custom woodwork",
  description:
    "Interior design, modular kitchens, wardrobes and custom woodwork, designed and built in Thanjavur since 1987.",
  phone: "+91 73737 30340",
  phoneHref: "tel:+917373730340",
  whatsapp: "917373730340",
  email: "dhuraimuthukumar@hotmail.com",
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

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export type Service = {
  title: string;
  description: string;
  icon: "kitchen" | "wardrobe" | "floor" | "ceiling" | "shield" | "hammer";
};

export const services: Service[] = [
  {
    title: "Modular kitchens",
    description:
      "Bespoke kitchens planned around how you cook, with practical storage and finishes that wear well.",
    icon: "kitchen",
  },
  {
    title: "Wardrobes & storage",
    description:
      "Fitted wardrobes and storage that make the most of every wall, corner and ceiling height.",
    icon: "wardrobe",
  },
  {
    title: "Wooden flooring",
    description:
      "Warm, hard-wearing wooden floors, supplied and laid with a finish made to last.",
    icon: "floor",
  },
  {
    title: "False ceilings",
    description:
      "Clean ceiling lines, cove lighting and concealed services, detailed to suit the room.",
    icon: "ceiling",
  },
  {
    title: "Mosquito netlon",
    description:
      "Made-to-measure netlon systems for windows and doors — effective, neat and easy to live with.",
    icon: "shield",
  },
  {
    title: "Custom woodwork",
    description:
      "Bespoke furniture, panelling and joinery, made in our workshop and fitted on site.",
    icon: "hammer",
  },
];

export const stats = [
  { value: "1987", label: "Established in Thanjavur" },
  { value: "35+", label: "Years of craftsmanship" },
  { value: "5-year", label: "Workmanship warranty" },
  { value: "60-day", label: "Typical project completion" },
];

export const processSteps = [
  {
    title: "Planning & concept",
    description:
      "We start with your routines, measurements and ideas, then shape a design that fits the space and the budget.",
  },
  {
    title: "Materials & quality",
    description:
      "Boards, finishes and fittings are selected together, with quality checks on materials and craftsmanship at every stage.",
  },
  {
    title: "A timeline you can plan around",
    description:
      "Once the design is approved, we set out a clear, personalised schedule for each phase — and keep you updated as we build.",
  },
];

export type Strength = {
  title: string;
  description: string;
  icon: "award" | "layers" | "shield" | "clock" | "refresh" | "sparkle";
};

export const strengths: Strength[] = [
  {
    title: "Crafting interiors since 1987",
    description:
      "Founded by Dhurai Raj, our studio has spent more than three decades shaping homes across the region.",
    icon: "award",
  },
  {
    title: "One team, start to finish",
    description:
      "Design, woodwork and installation are handled in-house, so the detail you approve is the detail you get.",
    icon: "layers",
  },
  {
    title: "Materials chosen to last",
    description:
      "We specify boards, finishes and fittings for daily life in Tamil Nadu's climate, not just for photographs.",
    icon: "shield",
  },
  {
    title: "A five-year warranty",
    description:
      "Our workmanship is covered for five years — a commitment we can make because we stand behind how we build.",
    icon: "clock",
  },
  {
    title: "Completed in about 60 days",
    description:
      "Most projects are finished within 60 days, with a schedule agreed before work begins.",
    icon: "refresh",
  },
  {
    title: "Support long after handover",
    description:
      "Need an adjustment or a repair years later? You can still call the same team that built your interiors.",
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
    src: "/images/lounge.jpg",
    alt: "Warm living room with timber flooring, leather seating and tall windows",
    caption: "Living & lounge",
  },
  {
    src: "/images/gallery-kitchen.jpg",
    alt: "Fitted kitchen with handleless cabinetry and a work island",
    caption: "Modular kitchens",
  },
  {
    src: "/images/gallery-wardrobe.jpg",
    alt: "Built-in wardrobe with glass-panel doors in a bright bedroom",
    caption: "Wardrobes & storage",
  },
  {
    src: "/images/living.jpg",
    alt: "Living room with timber flooring and panelled joinery",
    caption: "Wooden flooring & joinery",
  },
  {
    src: "/images/gallery-yellow.jpg",
    alt: "Living room with a yellow sofa, green wall and layered textiles",
    caption: "Colour & material",
  },
  {
    src: "/images/craft.jpg",
    alt: "Craftsperson turning a piece of timber on a lathe",
    caption: "Custom woodwork",
  },
  {
    src: "/images/gallery-courtyard.jpg",
    alt: "Warm entry courtyard with terracotta flooring, timber doors and a bench",
    caption: "Entrances & courtyards",
  },
  {
    src: "/images/gallery-green.jpg",
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

export function whatsappLink(message: string) {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string) {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
