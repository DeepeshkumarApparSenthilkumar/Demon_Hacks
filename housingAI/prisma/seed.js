const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 50 Chicago Neighborhoods with approximate centers and bounds
const chicagoNeighborhoods = [
  { name: 'Lincoln Park', centerLat: 41.9214, centerLng: -87.6513 },
  { name: 'Lake View', centerLat: 41.9400, centerLng: -87.6580 },
  { name: 'Logan Square', centerLat: 41.9287, centerLng: -87.7061 },
  { name: 'Wicker Park', centerLat: 41.9088, centerLng: -87.6796 },
  { name: 'West Loop', centerLat: 41.8825, centerLng: -87.6447 },
  { name: 'South Loop', centerLat: 41.8562, centerLng: -87.6247 },
  { name: 'River North', centerLat: 41.8924, centerLng: -87.6341 },
  { name: 'Old Town', centerLat: 41.9077, centerLng: -87.6375 },
  { name: 'Gold Coast', centerLat: 41.9058, centerLng: -87.6253 },
  { name: 'Streeterville', centerLat: 41.8929, centerLng: -87.6190 },
  { name: 'Hyde Park', centerLat: 41.7943, centerLng: -87.5907 },
  { name: 'Bronzeville', centerLat: 41.8251, centerLng: -87.6174 },
  { name: 'Pilsen', centerLat: 41.8543, centerLng: -87.6635 },
  { name: 'Bridgeport', centerLat: 41.8364, centerLng: -87.6487 },
  { name: 'Bucktown', centerLat: 41.9228, centerLng: -87.6800 },
  { name: 'Ukrainian Village', centerLat: 41.8994, centerLng: -87.6841 },
  { name: 'Roscoe Village', centerLat: 41.9400, centerLng: -87.6833 },
  { name: 'North Center', centerLat: 41.9560, centerLng: -87.6833 },
  { name: 'Lincoln Square', centerLat: 41.9686, centerLng: -87.6889 },
  { name: 'Edgewater', centerLat: 41.9839, centerLng: -87.6601 },
  { name: 'Rogers Park', centerLat: 42.0094, centerLng: -87.6756 },
  { name: 'Uptown', centerLat: 41.9665, centerLng: -87.6533 },
  { name: 'Avondale', centerLat: 41.9415, centerLng: -87.7025 },
  { name: 'Irving Park', centerLat: 41.9536, centerLng: -87.7325 },
  { name: 'Portage Park', centerLat: 41.9536, centerLng: -87.7644 },
  { name: 'Jefferson Park', centerLat: 41.9712, centerLng: -87.7616 },
  { name: 'Norwood Park', centerLat: 41.9856, centerLng: -87.7992 },
  { name: 'Edison Park', centerLat: 42.0054, centerLng: -87.8133 },
  { name: 'Forest Glen', centerLat: 41.9786, centerLng: -87.7554 },
  { name: 'Albany Park', centerLat: 41.9689, centerLng: -87.7197 },
  { name: 'North Park', centerLat: 41.9844, centerLng: -87.7265 },
  { name: 'West Ridge', centerLat: 42.0006, centerLng: -87.6931 },
  { name: 'Humboldt Park', centerLat: 41.9017, centerLng: -87.7025 },
  { name: 'Garfield Park', centerLat: 41.8817, centerLng: -87.7128 },
  { name: 'Austin', centerLat: 41.8929, centerLng: -87.7617 },
  { name: 'Lawndale', centerLat: 41.8517, centerLng: -87.7128 },
  { name: 'Little Village', centerLat: 41.8444, centerLng: -87.7025 },
  { name: 'McKinley Park', centerLat: 41.8317, centerLng: -87.6719 },
  { name: 'Chinatown', centerLat: 41.8511, centerLng: -87.6331 },
  { name: 'Armour Square', centerLat: 41.8336, centerLng: -87.6331 },
  { name: 'Douglas', centerLat: 41.8347, centerLng: -87.6189 },
  { name: 'Oakland', centerLat: 41.8228, centerLng: -87.6033 },
  { name: 'Kenwood', centerLat: 41.8094, centerLng: -87.5969 },
  { name: 'Woodlawn', centerLat: 41.7806, centerLng: -87.5969 },
  { name: 'South Shore', centerLat: 41.7606, centerLng: -87.5753 },
  { name: 'Chatham', centerLat: 41.7406, centerLng: -87.6142 },
  { name: 'Auburn Gresham', centerLat: 41.7436, centerLng: -87.6561 },
  { name: 'Englewood', centerLat: 41.7753, centerLng: -87.6414 },
  { name: 'Gage Park', centerLat: 41.7953, centerLng: -87.6961 },
  { name: 'Clearing', centerLat: 41.7786, centerLng: -87.7664 },

  // New Bridgeport-Adjacent Areas
  { name: 'Canaryville', centerLat: 41.8150, centerLng: -87.6430 },
  { name: 'Back of the Yards', centerLat: 41.8070, centerLng: -87.6650 },
  { name: 'Brighton Park', centerLat: 41.8190, centerLng: -87.6990 },
  { name: 'New City', centerLat: 41.8080, centerLng: -87.6600 },
  { name: 'Fuller Park', centerLat: 41.8090, centerLng: -87.6330 },
  { name: 'Bridgeport North', centerLat: 41.8450, centerLng: -87.6480 },
  { name: 'Bridgeport East', centerLat: 41.8360, centerLng: -87.6350 },

  // New West Side Areas
  { name: 'East Garfield Park', centerLat: 41.8819, centerLng: -87.7025 },
  { name: 'West Garfield Park', centerLat: 41.8800, centerLng: -87.7300 },
  { name: 'North Lawndale', centerLat: 41.8580, centerLng: -87.7130 },
  { name: 'South Lawndale', centerLat: 41.8380, centerLng: -87.7120 },
  { name: 'Near West Side', centerLat: 41.8740, centerLng: -87.6630 },
  { name: 'Lower West Side', centerLat: 41.8540, centerLng: -87.6630 },
  { name: 'Cicero', centerLat: 41.8456, centerLng: -87.7539 },
  { name: 'Berwyn', centerLat: 41.8506, centerLng: -87.7936 },
  { name: 'Oak Park', centerLat: 41.8850, centerLng: -87.7845 },

  // New Far South / South Areas
  { name: 'Beverly', centerLat: 41.7170, centerLng: -87.6760 },
  { name: 'Morgan Park', centerLat: 41.6870, centerLng: -87.6690 },
  { name: 'Mount Greenwood', centerLat: 41.6930, centerLng: -87.7120 },
  { name: 'Washington Heights', centerLat: 41.7160, centerLng: -87.6500 },
  { name: 'Roseland', centerLat: 41.7000, centerLng: -87.6200 },
  { name: 'Pullman', centerLat: 41.6950, centerLng: -87.6050 },
  { name: 'West Pullman', centerLat: 41.6700, centerLng: -87.6300 },
  { name: 'Riverdale', centerLat: 41.6600, centerLng: -87.6100 },
  { name: 'Hegewisch', centerLat: 41.6550, centerLng: -87.5450 },
  { name: 'South Deering', centerLat: 41.7000, centerLng: -87.5700 },
  { name: 'East Side', centerLat: 41.7000, centerLng: -87.5350 },
  { name: 'Calumet Heights', centerLat: 41.7300, centerLng: -87.5800 },
  { name: 'Avalon Park', centerLat: 41.7450, centerLng: -87.5900 },
  { name: 'Greater Grand Crossing', centerLat: 41.7650, centerLng: -87.6150 },
  { name: 'Washington Park', centerLat: 41.7900, centerLng: -87.6180 },
  { name: 'Grand Boulevard', centerLat: 41.8100, centerLng: -87.6180 },
]

const validUrls = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1481253127861-534498168948?w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
];

async function main() {
  console.log('Starting seed...')
  console.log('Cleaning up existing database records...')

  await prisma.listing.deleteMany()
  await prisma.demographic.deleteMany()
  await prisma.crimeStat.deleteMany()
  await prisma.neighborhood.deleteMany()
  await prisma.landlord.deleteMany()


  console.log('Fetching live real estate data from City of Chicago Open Data API...')
  const response = await fetch('https://data.cityofchicago.org/resource/s6ha-ppgi.json?$limit=800')
  const chicagoApiData = await response.json()
  console.log(`Successfully fetched ${chicagoApiData.length} multi-family properties!`)

  // Extract unique neighborhoods from the API response
  const uniqueHoods = new Map()

  for (const property of chicagoApiData) {
    if (!property.community_area || !property.latitude || !property.longitude) continue

    const hoodName = property.community_area.trim()
    if (!uniqueHoods.has(hoodName)) {
      uniqueHoods.set(hoodName, {
        name: hoodName,
        centerLat: parseFloat(property.latitude),
        centerLng: parseFloat(property.longitude)
      })
    }
  }

  // Create Neighborhoods & Demographics & Crime Stats based on real City of Chicago community areas
  const hoodMap = {}
  for (const hood of Array.from(uniqueHoods.values())) {
    const neighborhood = await prisma.neighborhood.create({
      data: {
        name: hood.name,
        centerLat: hood.centerLat,
        centerLng: hood.centerLng,
        demographics: {
          create: {
            population: Math.floor(Math.random() * 50000) + 10000,
            medianIncome: Math.floor(Math.random() * 100000) + 40000,
            livabilityScore: Math.floor(Math.random() * 40) + 60,
            gentrificationIdx: Math.floor(Math.random() * 100),
          },
        },
        crimeStats: {
          create: {
            year: 2024,
            month: 10,
            violentCount: Math.floor(Math.random() * 50),
            propertyCount: Math.floor(Math.random() * 200),
            crimeScore: Math.floor(Math.random() * 40) + 60,
          },
        },
      },
    })
    hoodMap[hood.name] = neighborhood.id
    console.log(`Created neighborhood from API: ${neighborhood.name}`)
  }

  // Create a base Landlord
  const genericLandlord = await prisma.landlord.create({
    data: {
      name: `City Corporate Management`,
      company: `Chicago Realty Matrix`,
      reputationScore: 82,
    }
  })

  // Iterate over the real multi-family housing points and explode their density by creating ~45 synthetic units around each one.
  for (const realProperty of chicagoApiData) {
    if (!realProperty.latitude || !realProperty.longitude || !realProperty.community_area) continue

    const baseLat = parseFloat(realProperty.latitude)
    const baseLng = parseFloat(realProperty.longitude)
    const hoodId = hoodMap[realProperty.community_area.trim()]
    const baseAddress = realProperty.address

    for (let i = 0; i < 45; i++) {
      // Create a micro-cluster around the real building representing actual city density
      const lat = baseLat + (Math.random() - 0.5) * 0.005
      const lng = baseLng + (Math.random() - 0.5) * 0.005

      await prisma.listing.create({
        data: {
          address: `${Math.floor(Math.random() * 9999) + 1} Near ${baseAddress}`,
          unit: `#${Math.floor(Math.random() * 500)}`,
          neighborhoodId: hoodId,
          lat,
          lng,
          price: Math.floor(Math.random() * 2800) + 750,
          bedrooms: Math.floor(Math.random() * 4) + 1,
          bathrooms: Math.floor(Math.random() * 2) + 1,
          sqft: Math.floor(Math.random() * 1000) + 500,
          description: `Beautiful unit located next to ${realProperty.property_name || 'residential complex'}.`,
          images: [...validUrls].sort(() => 0.5 - Math.random()).slice(0, 2),
          petFriendly: Math.random() > 0.5,
          parkingIncluded: Math.random() > 0.7,
          utilitiesIncluded: Math.random() > 0.8,
          section8Accepted: Math.random() > 0.8,
          availableFrom: new Date(),
          landlordId: genericLandlord.id,
        }
      })
    }
  }

  // Raw SQL update to set PostGIS point geometries
  console.log('Generating PostGIS geometries...')
  await prisma.$executeRaw`UPDATE "Listing" SET "location" = ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)`

  console.log('Seed completed successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
