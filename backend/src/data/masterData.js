const seedCustomers = [
  {
    customer_code: 'C00001',
    customer_name: 'Gupta Enterprize Pvt. Ltd.',
    address: 'Gurgaon, Haryana',
    pan_number: 'BCNSG1234H',
    gst_number: '06BCNSG1234H1Z5',
    status: 'active',
  },
  {
    customer_code: 'C00002',
    customer_name: 'Mahesh Industries Pvt. Ltd.',
    address: 'Delhi, Delhi',
    pan_number: 'AMNSM1234U',
    gst_number: '07AMNSM1234U1Z5',
    status: 'active',
  },
  {
    customer_code: 'C00003',
    customer_name: 'Omkar and Brothers Pvt. Ltd.',
    address: 'Uttrakhand, Uttar Pradesh',
    pan_number: 'CNBSO1234S',
    gst_number: '05CNBSO1234S1Z5',
    status: 'inactive',
  },
  {
    customer_code: 'C00004',
    customer_name: 'Bhuwan Infotech.',
    address: 'Alwar, Rajasthan',
    pan_number: 'CMNSB1234A',
    gst_number: '08CMNSB1234A1Z5',
    status: 'active',
  },
  {
    customer_code: 'C00005',
    customer_name: 'Swastik Software Pvt. Ltd.',
    address: 'Gurgaon, Haryana',
    pan_number: 'AGBCS1234B',
    gst_number: '06AGBCS1234B1Z5',
    status: 'active',
  },
];

const seedItems = [
  { item_code: 'IT00001', item_name: 'Laptop', unit_price: 85000, status: 'active' },
  { item_code: 'IT00002', item_name: 'LED Monitor', unit_price: 13450, status: 'active' },
  { item_code: 'IT00003', item_name: 'Pen Drive', unit_price: 980, status: 'active' },
  { item_code: 'IT00004', item_name: 'Mobile', unit_price: 18900, status: 'active' },
  { item_code: 'IT00005', item_name: 'Headphone', unit_price: 2350, status: 'inactive' },
  { item_code: 'IT00006', item_name: 'Bagpack', unit_price: 1200, status: 'active' },
  { item_code: 'IT00007', item_name: 'Powerbank', unit_price: 1400, status: 'active' },
];

module.exports = {
  seedCustomers,
  seedItems,
};
