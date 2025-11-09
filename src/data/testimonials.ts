export type Testimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 'maria-garcia',
    name: 'María García',
    role: 'Visitante',
    text: `Belmontejo es un remanso de paz en medio de la Mancha. Sus calles tranquilas y la hospitalidad de su gente hacen que uno se sienta como en casa. Es el lugar perfecto para desconectar y disfrutar de la autenticidad rural.`,
    image: '/assets/images/reviews/profile-4.png',
    imageAlt: 'Retrato de María García',
  },
  {
    id: 'antonio-ruiz',
    name: 'Antonio Ruiz',
    role: 'Vecino',
    text: `Aquí el tiempo se detiene y uno puede apreciar la belleza sencilla de la vida rural. Los paisajes, las tradiciones y el patrimonio de Belmontejo crean una experiencia única que nunca se olvida.`,
    image: '/assets/images/reviews/profile5.png',
    imageAlt: 'Retrato de Antonio Ruiz',
  },
  {
    id: 'carlos-jimenez',
    name: 'Carlos Jiménez',
    role: 'Turista',
    text: `Vine de Madrid buscando tranquilidad y encontré mucho más que eso. La iglesia de Nuestra Señora de la Asunción es impresionante, y las fuentes del pueblo cuentan historias de generaciones pasadas. Un verdadero tesoro manchego.`,
    image: '/assets/svgs/profile.svg',
    imageAlt: 'Retrato de Carlos Jiménez',
  },
  {
    id: 'elena-martin',
    name: 'Dra. Elena Martín',
    role: 'Investigadora',
    text: `Como investigadora de patrimonio rural, Belmontejo me fascinó por sus vestigios arqueológicos y su trazado urbano histórico. Es un ejemplo perfecto de cómo un pueblo pequeño puede conservar su esencia a través de los siglos.`,
    image: '/assets/svgs/profile-woman.svg',
    imageAlt: 'Retrato de la Dra. Elena Martín',
  },
  {
    id: 'miguel-angel-lopez',
    name: 'Miguel Ángel López',
    role: 'Visitante habitual',
    text: `Cada primavera regreso a Belmontejo para disfrutar de los campos en flor y de la calidez de su gente. Es un lugar que te abraza y te hace sentir parte de algo especial, de una comunidad auténtica.`,
    image: '/assets/svgs/profile.svg',
    imageAlt: 'Retrato de Miguel Ángel López',
  },
  {
    id: 'ana-belen-torres',
    name: 'Ana Belén Torres',
    role: 'Madre de familia',
    text: `Mis hijos descubrieron en Belmontejo lo que significa la vida sin prisas. Correr por sus calles empedradas, escuchar el silencio del campo... Es un regalo para toda la familia alejarse del ruido de la ciudad.`,
    image: '/assets/svgs/profile-woman.svg',
    imageAlt: 'Retrato de Ana Belén Torres',
  },
];
