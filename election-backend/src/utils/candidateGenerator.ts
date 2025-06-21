const firstNames = [
  'Alexander', 'Sarah', 'Michael', 'Elena', 'David', 'Amanda', 'Robert', 'Maria',
  'James', 'Jessica', 'William', 'Ashley', 'Christopher', 'Emily', 'Matthew', 'Lisa',
  'Anthony', 'Michelle', 'Daniel', 'Jennifer', 'Joshua', 'Rachel', 'Andrew', 'Laura',
  'Kevin', 'Rebecca', 'Brian', 'Stephanie', 'Thomas', 'Nicole', 'Charles', 'Angela',
  'Joseph', 'Kimberly', 'Patrick', 'Deborah', 'Richard', 'Amy', 'Mark', 'Patricia'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const parties = [
  'Progressive Alliance', 'Unity Party', 'Citizens First', 'Economic Freedom',
  'Green Future', 'Tech Innovation', 'Social Reform', 'Independent Coalition',
  'Liberty Movement', 'Community Action', 'Democratic Reform', 'Conservative Union',
  'Workers Party', 'Environmental Action', 'New Vision', 'People\'s Choice'
];

const professions = [
  'business owner', 'teacher', 'lawyer', 'doctor', 'engineer', 'consultant',
  'nonprofit director', 'community organizer', 'former mayor', 'city council member',
  'school board president', 'healthcare administrator', 'military veteran',
  'environmental scientist', 'social worker', 'union leader', 'small business advocate',
  'technology executive', 'public health official', 'education administrator'
];

const experiences = [
  'with over 15 years of community service',
  'and 10 years of public sector experience',
  'with extensive background in local government',
  'and proven track record in policy development',
  'with deep roots in the community',
  'and commitment to transparent governance',
  'with experience in grassroots organizing',
  'and background in fiscal management',
  'with expertise in sustainable development',
  'and history of bipartisan collaboration'
];

const policies = [
  'economic development', 'education reform', 'healthcare access', 'environmental protection',
  'affordable housing', 'infrastructure improvement', 'public safety', 'social services',
  'technology innovation', 'government transparency', 'fiscal responsibility', 'community engagement',
  'renewable energy', 'transportation planning', 'small business support', 'youth programs'
];

const profileImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b332c2f8?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateRandomCandidate() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const party = getRandomElement(parties);
  const profession = getRandomElement(professions);
  const experience = getRandomElement(experiences);
  const selectedPolicies = getRandomElements(policies, Math.floor(Math.random() * 3) + 2);
  const image = getRandomElement(profileImages);

  const description = `${profession.charAt(0).toUpperCase() + profession.slice(1)} ${experience}. Focuses on ${selectedPolicies.join(', ')}. Committed to serving the community and bringing positive change through collaborative leadership and evidence-based policy making.`;

  return {
    name,
    image,
    party,
    description
  };
} 