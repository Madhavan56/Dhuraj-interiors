export const business = {
  name: "Laghara Hardwares",
  shortName: "Laghara",
  tagline: "Interior & furniture materials",
  description:
    "Interior and furniture materials for builders, carpenters and designers. Trade-grade stock, honest pricing, delivered on schedule across Tamil Nadu.",
  phone: "+91 73737 30340",
  phoneHref: "tel:+917373730340",
  whatsapp: "917373730340",
  email: "dhuraimuthukumar@hotmail.com",
  address: "1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613 004",
  locality: "Thanjavur, Tamil Nadu",
  hours: "Mon to Sat, 9 AM to 6 PM",
  website: "www.dhurajinterior.in",
  websiteHref: "https://www.dhurajinterior.in",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Laghara Hardwares, 1243 Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613004"),
  mapEmbed:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613004") +
    "&z=15&output=embed",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Brands", href: "#brands" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export type Category = {
  slug: string;
  name: string;
  group: "Surfaces" | "Kitchen" | "Wardrobe" | "Fittings";
  description: string;
  image: string;
  alt: string;
};

export const categories: Category[] = [
  {
    slug: "plywood",
    name: "Plywood",
    group: "Surfaces",
    description: "Sheet material for carcasses, wardrobes and full-room fit-outs.",
    image: "/images/categories/plywood-960.jpg",
    alt: "Plywood sheet showing its layered cross-section",
  },
  {
    slug: "mica-laminates",
    name: "Mica Laminates",
    group: "Surfaces",
    description: "Decorative surfaces that set the finish of a room.",
    image: "/images/categories/mica-laminates-960.jpg",
    alt: "White marble-pattern laminate surface with grey veining",
  },
  {
    slug: "kitchen-hardware",
    name: "Kitchen Hardware",
    group: "Kitchen",
    description: "Baskets, organisers and fittings for a fitted kitchen.",
    image: "/images/categories/kitchen-hardware-960.jpg",
    alt: "Modern fitted kitchen with handleless cabinetry",
  },
  {
    slug: "wardrobe-hardware",
    name: "Wardrobe Hardware",
    group: "Wardrobe",
    description: "Rails, runners and internal fittings for built-in storage.",
    image: "/images/categories/wardrobe-hardware-960.jpg",
    alt: "Built-in white wardrobes with glass-panel doors in a bright bedroom",
  },
  {
    slug: "hinges",
    name: "Hinges",
    group: "Fittings",
    description: "Everyday and soft-close hinges for cabinet doors.",
    image: "/images/categories/hinges-960.jpg",
    alt: "Soft-close hinge fitted to a kitchen cabinet door",
  },
  {
    slug: "drawer-systems",
    name: "Drawer Systems",
    group: "Kitchen",
    description: "Drawer boxes and internal organisers, specified as a set.",
    image: "/images/categories/drawer-systems-960.jpg",
    alt: "Open kitchen drawer with a wooden cutlery organiser",
  },
  {
    slug: "drawer-channels",
    name: "Drawer Channels",
    group: "Fittings",
    description: "Slide rails for smooth-running drawers at every size.",
    image: "/images/categories/drawer-channels-960.jpg",
    alt: "Drawer slide rails with mounting wheel detail",
  },
  {
    slug: "handles-knobs",
    name: "Handles & Knobs",
    group: "Fittings",
    description: "Pulls, levers and knobs that finish the detail.",
    image: "/images/categories/handles-knobs-960.jpg",
    alt: "Brushed steel lever handle with keyed lock",
  },
  {
    slug: "sliding-systems",
    name: "Sliding Systems",
    group: "Wardrobe",
    description: "Sliding hardware for wardrobes, doors and partitions.",
    image: "/images/categories/sliding-systems-960.jpg",
    alt: "Living room with large sliding glass doors opening to a patio",
  },
  {
    slug: "locks-security",
    name: "Locks & Security",
    group: "Fittings",
    description: "Locks and security fittings for doors and cabinets.",
    image: "/images/categories/locks-security-960.jpg",
    alt: "Multi-point security door lock with lever handle and key",
  },
  {
    slug: "aluminium-profiles",
    name: "Aluminium Profiles",
    group: "Surfaces",
    description: "Extruded profiles for edges, frames and partitions.",
    image: "/images/categories/aluminium-profiles-960.jpg",
    alt: "Stacked extruded aluminium profiles",
  },
  {
    slug: "interior-hardware",
    name: "Interior Hardware",
    group: "Fittings",
    description: "Screws, fasteners and the small parts that hold it together.",
    image: "/images/categories/interior-hardware-960.jpg",
    alt: "Sorted compartments of steel wood screws",
  },
  {
    slug: "furniture-accessories",
    name: "Furniture Accessories",
    group: "Wardrobe",
    description: "Knobs, feet, organisers and finishing touches.",
    image: "/images/categories/furniture-accessories-960.jpg",
    alt: "Small wooden drawer unit with ceramic knobs",
  },
];

export const categoryGroups = ["All", "Surfaces", "Kitchen", "Wardrobe", "Fittings"] as const;

export type FeaturedRange = {
  name: string;
  category: string;
  description: string;
  image: string;
  alt: string;
};

export const featuredRanges: FeaturedRange[] = [
  {
    name: "Plywood",
    category: "Sheets & boards",
    description: "Carcasses, wardrobes and full-room fit-outs start here.",
    image: "/images/categories/plywood-960.jpg",
    alt: "Plywood sheet showing its layered cross-section",
  },
  {
    name: "Mica Laminates",
    category: "Surfaces",
    description: "Choose the finish that sets the tone of the room.",
    image: "/images/categories/mica-laminates-960.jpg",
    alt: "White marble-pattern laminate surface with grey veining",
  },
  {
    name: "Kitchen Hardware",
    category: "Kitchen",
    description: "Baskets, hinges and organisers, specified together.",
    image: "/images/categories/kitchen-hardware-960.jpg",
    alt: "Modern fitted kitchen with handleless cabinetry",
  },
  {
    name: "Handles & Knobs",
    category: "Fittings",
    description: "The last detail — and the first thing you touch.",
    image: "/images/categories/handles-knobs-960.jpg",
    alt: "Brushed steel lever handle with keyed lock",
  },
];

export type Service = {
  title: string;
  description: string;
  icon: "tag" | "truck" | "store" | "clipboard" | "receipt" | "returns";
};

export const services: Service[] = [
  {
    title: "Trade & bulk pricing",
    description:
      "Project quantities of plywood, laminates and hardware, priced for builders and carpenters.",
    icon: "tag",
  },
  {
    title: "Delivery across Tamil Nadu",
    description: "Quick delivery in 2 days, standard in 4 to 6 days.",
    icon: "truck",
  },
  {
    title: "Showroom consultation",
    description:
      "See and compare materials in person at our Thanjavur showroom before you commit.",
    icon: "store",
  },
  {
    title: "Full project supply",
    description:
      "Tell us what the fit-out needs and we'll quote the material list in project quantities.",
    icon: "clipboard",
  },
  {
    title: "GST invoicing",
    description: "Every price includes GST, and every order comes with a GST invoice.",
    icon: "receipt",
  },
  {
    title: "Easy returns",
    description: "Unopened stock can be returned. Talk to us and we'll sort it out.",
    icon: "returns",
  },
];

export type Strength = {
  title: string;
  description: string;
  icon: "layers" | "shield" | "rupee" | "truck" | "eye" | "refresh";
};

export const strengths: Strength[] = [
  {
    title: "Thirteen categories, one roof",
    description:
      "From the plywood carcass to the last knob, the whole material list is in one place.",
    icon: "layers",
  },
  {
    title: "Trade-grade stock",
    description:
      "Materials selected for builders, carpenters and designers working on real projects.",
    icon: "shield",
  },
  {
    title: "Honest, inclusive pricing",
    description: "The price you're quoted includes GST. No surprises at the counter.",
    icon: "rupee",
  },
  {
    title: "Delivery you can plan around",
    description:
      "Quick delivery in 2 days and standard in 4 to 6 days, across Tamil Nadu.",
    icon: "truck",
  },
  {
    title: "See it before you buy",
    description:
      "Our showroom is open Monday to Saturday so you can handle the material first.",
    icon: "eye",
  },
  {
    title: "Straightforward returns",
    description: "Unopened stock can be returned — a simple conversation, not a process.",
    icon: "refresh",
  },
];

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  span: string;
};

export const gallery: GalleryItem[] = [
  {
    src: "/images/lounge.jpg",
    alt: "Living room with timber flooring, leather seating and tall windows",
    caption: "Living & lounge fit-outs",
    span: "sm:col-span-2 lg:col-span-5 lg:row-span-2",
  },
  {
    src: "/images/categories/handles-knobs-960.jpg",
    alt: "Brushed steel lever handle and lock",
    caption: "Handles & locks",
    span: "lg:col-span-3",
  },
  {
    src: "/images/categories/mica-laminates-960.jpg",
    alt: "White marble-pattern laminate surface",
    caption: "Decorative laminates",
    span: "lg:col-span-2",
  },
  {
    src: "/images/categories/drawer-systems-960.jpg",
    alt: "Open drawer with a wooden cutlery organiser",
    caption: "Drawer systems",
    span: "lg:col-span-2",
  },
  {
    src: "/images/living.jpg",
    alt: "Living room with a timber floor and panelled joinery",
    caption: "Joinery & finishes",
    span: "lg:col-span-3 lg:row-span-2",
  },
  {
    src: "/images/categories/wardrobe-hardware-960.jpg",
    alt: "Built-in wardrobe with glass-panel doors",
    caption: "Wardrobe internals",
    span: "lg:col-span-2",
  },
  {
    src: "/images/categories/plywood-960.jpg",
    alt: "Plywood sheet showing its layered cross-section",
    caption: "Plywood & boards",
    span: "lg:col-span-2",
  },
  {
    src: "/images/categories/kitchen-hardware-960.jpg",
    alt: "Modern fitted kitchen with handleless cabinetry",
    caption: "Fitted kitchens",
    span: "lg:col-span-5",
  },
];

export const stats = [
  { value: "13", label: "Material categories" },
  { value: "2", label: "Day quick delivery" },
  { value: "30%", label: "Trade rates, up to" },
  { value: "6", label: "Days a week at the showroom" },
];

export const enquiryTypes = [
  "Product availability",
  "Trade & bulk pricing",
  "Delivery",
  "Showroom visit",
  "Something else",
] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string) {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
