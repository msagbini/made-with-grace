const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'galletas-mensaje' },
      update: {},
      create: {
        name: 'Galletas con Mensaje',
        description: 'Personaliza con tu propio mensaje',
        slug: 'galletas-mensaje',
        basePrice: 15.99,
        displayOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'galletas-foto' },
      update: {},
      create: {
        name: 'Galletas con Foto',
        description: 'Sube tu foto favorita',
        slug: 'galletas-foto',
        basePrice: 24.99,
        displayOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'galletas-tematicas' },
      update: {},
      create: {
        name: 'Galletas Temáticas',
        description: 'Diseños especiales y temáticos',
        slug: 'galletas-tematicas',
        basePrice: 19.99,
        displayOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pack-mixto' },
      update: {},
      create: {
        name: 'Pack Mixto',
        description: 'Variedad de sabores y diseños',
        slug: 'pack-mixto',
        basePrice: 34.99,
        displayOrder: 4,
      },
    }),
  ]);

  // Crear productos de ejemplo
  await Promise.all([
    prisma.product.upsert({
      where: { slug: 'mini-mensaje' },
      update: {},
      create: {
        name: 'Mini Galleta con Mensaje',
        slug: 'mini-mensaje',
        categoryId: categories[0].id,
        description: 'Pequeña galleta personalizada con tu mensaje',
        displayOrder: 1,
        customizations: JSON.stringify([
          {
            type: 'text',
            label: 'Mensaje',
            required: true,
            maxLength: 20,
          },
          {
            type: 'color',
            label: 'Color de Glaseado',
            required: false,
            allowedValues: ['rojo', 'azul', 'rosa', 'amarillo'],
          },
        ]),
      },
    }),
  ]);

  // Configuración de la app
  await prisma.appConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultExpressFee: 0.5,
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      maxFileSize: 5242880,
      allowedFileTypes: 'jpg,jpeg,png,webp',
      expressDeliveryHours: 24,
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
