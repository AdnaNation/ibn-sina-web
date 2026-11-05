// Data taken from https://www.ibnsinatrust.com — replace/extend via the admin panel later.
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// [name, area, city, type]
const U = [
  ['Ibn Sina Specialized Hospital', 'Dhanmondi', 'Dhaka', 'Hospital'],
  ['Ibn Sina Medical College Hospital', 'Kallyanpur', 'Dhaka', 'Hospital'],
  ['Ibn Sina Diagnostic & Imaging Center', 'Dhanmondi', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Cancer Diagnostic Center', 'Dhanmondi', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina D.Lab & Consultation Center', 'Doyagonj', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Medical Imaging Center', 'Zigatola', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Badda', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Medical Check-up Unit', 'Badda', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Uttara', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Malibagh', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Mirpur', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Jatrabari', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic Center', 'Lalbagh', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Keraniganj', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Arshinagar', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Savar', 'Dhaka', 'Diagnostic'],
  ['Ibn Sina Medical College', 'Kallyanpur', 'Dhaka', 'Education'],
  ['Ibn Sina Nursing Institute', 'Kallyanpur', 'Dhaka', 'Education'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Chattogram', 'Chattogram', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Cumilla', 'Cumilla', 'Diagnostic'],
  ['Ibn Sina Hospital & Diagnostic Center', 'Noakhali', 'Noakhali', 'Hospital'],
  ['Ibn Sina Hospital Sylhet', 'Sylhet', 'Sylhet', 'Hospital'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Rajshahi', 'Rajshahi', 'Diagnostic'],
  ['Ibn Sina Diagnostic & Consultation Center', 'Bogura', 'Bogura', 'Diagnostic'],
  ['Ibn Sina Hospital & Diagnostic Center', 'Bogura', 'Bogura', 'Hospital'],
  ['Ibn Sina Hospital & Diagnostic Center', 'Jashore', 'Jashore', 'Hospital'],
];

export const units = U.map(([name, area, city, type], i) => ({
  slug: slug(`${name}-${area}-${type === 'Hospital' && area === 'Bogura' ? 'hospital' : ''}`),
  name, area, city, type, order: i, hotline: '',
}));

export const departments = [
  'Cardiology', 'Medicine', 'Neurology', 'Gynaecology & Obstetrics', 'Pediatrics', 'Orthopedic Surgery',
  'General Surgery', 'Gastroenterology', 'Endocrinology', 'Nephrology', 'Oncology', 'Ophthalmology',
  'ENT', 'Dental', 'Psychiatry', 'Chest Medicine', 'Radiology & Imaging', 'Physical Medicine', 'Nutrition',
].map((name) => ({ name, slug: slug(name) }));

const D = [
  ['Dr. Muhammed Akhtaruzzaman', 'Cardiology', 'Ibn Sina Diagnostic & Consultation Center, Savar'],
  ['Prof. Dr. Musarrat Sultana (Sumi)', 'Gynaecology & Obstetrics', 'Ibn Sina Diagnostic & Imaging Center, Dhanmondi'],
  ['Professor Dr. Md. Abdul Hayee', 'Neurology', 'Ibn Sina Diagnostic & Imaging Center, Dhanmondi'],
  ['Prof. Dr. Muhammad Salahuddin', 'Medicine', 'Ibn Sina Diagnostic & Consultation Center, Chattogram'],
  ['Dr. Rezwana Sobhan', 'Endocrinology', 'Ibn Sina Cancer Diagnostic Center, Dhanmondi'],
  ['Dr. Anis Uddin Ahmed', 'Ophthalmology', 'Ibn Sina Medical College Hospital, Kallyanpur'],
  ['Dr. Md. Mushfiqur Rahman', 'Vascular Surgery', 'Ibn Sina Diagnostic & Imaging Center, Dhanmondi'],
  ['Dr. Mohammad Abu Kauser', 'Cardiology', 'Ibn Sina Medical Imaging Center, Zigatola'],
  ['Dr. Rabab Sultana', 'Oncology', 'Ibn Sina Specialized Hospital, Dhanmondi'],
  ['Prof. Dr. Naznin Rashid Shewly', 'Gynaecology & Obstetrics', 'Ibn Sina Diagnostic & Consultation Center, Mirpur'],
  ['Dr. Abu Raihan Siddik', 'Gastroenterology (Liver)', 'Ibn Sina D.Lab & Consultation Center, Doyagonj'],
  ['Dr. Tanjina Anowar', 'Radiology & Imaging', 'Ibn Sina Diagnostic & Consultation Center, Chattogram'],
];
export const doctors = D.map(([name, department, unit], i) => ({
  slug: slug(name), name, department, unit, phone: '', photo: null, featured: i < 8,
}));

export const services = [
  { slug: 'hospital', title: 'Hospital services', order: 1, href: '/services/hospital',
    text: 'Two modern cath labs, round-the-clock CCU, adult and pediatric cardiac surgery, a stroke unit with DSA, and vascular surgery.' },
  { slug: 'radiology', title: 'Radiology & imaging', order: 2, href: '/services/radiology',
    text: '3 Tesla MRI, multi-slice CT, digital X-ray and 4D ultrasonography, reported by consultants trained in Europe and North America.' },
  { slug: 'laboratory', title: 'Laboratory', order: 3, href: '/services/laboratory',
    text: 'Automated biochemistry and immunology, HPLC-based HbA1c, a 64-allergen panel, and PCR-based molecular diagnostics.' },
  { slug: 'diabetes', title: 'Diabetes center', order: 4, href: '/services/diabetes',
    text: 'Screening, monitoring and long-term care for diabetes and other metabolic conditions.' },
  { slug: 'pain-physiotherapy', title: 'Pain & physiotherapy', order: 5, href: '/services/pain-physiotherapy',
    text: 'Pain specialists and physiotherapists with modern equipment for pain management and rehabilitation.' },
  { slug: 'dental', title: 'Dental center', order: 6, href: '/services/dental',
    text: 'Oral and maxillofacial surgery, cosmetic and general dentistry by male and female dental surgeons.' },
];
