interface Topic {
    title: string;
    subTopics: string[];
    details: any[]; 
}

  
  export const combinedDataset: Topic[] = [
    {
      title: 'Accommodation',
      subTopics: ['Hotel', 'Home Stays', 'Villas', 'Ayurvedic Spa'],
      details: [
        
      ]
    },
    {
      title: 'Vehicle Rent',
      subTopics: [ 'Car', 'Van', 'Bicycle', 'Scooter' ],
      details: [
        
      ]
      
    },
    {
      title: "Tour Guides",
      subTopics: ["English", "German", "French"],
      details: [
        
      ]
    },    
    {
      title: 'Restaurant',
      subTopics: ['Street Food', 'Chinese', 'Indian', 'Others', 'Casual Dining'],
      details: [
        
      ]
    },
    
    {
      title: "Adventure Sports",
      subTopics: ["Diving", "Hiking", "Air Adventures"],
      details: [
        
      ]
    }
    ,
    {
      title: 'Emergency Services',
      subTopics: ['Tourism Police', 'Embassy'],
      details: [
        {
          serviceType: 'Tourism Police',
          location: 'Colombo, Police Headquarters',
          contactNumber: '+94 11 242 1111',
          serviceHours: '24/7'
        },
        {
          serviceType: 'Tourism Police',
          location: 'Kandy, Police Station',
          contactNumber: '+94 81 223 2323',
          serviceHours: '24/7'
        },
        {
          serviceType: 'Embassy',
          location: 'US Embassy, Colombo 3',
          contactNumber: '+94 11 249 8500',
          serviceHours: 'Mon-Fri, 8:30 AM - 5:30 PM'
        },
        {
          serviceType: 'Embassy',
          location: 'British High Commission, Colombo 7',
          contactNumber: '+94 11 539 0639',
          serviceHours: 'Mon-Fri, 8:00 AM - 4:00 PM'
        },
        {
          serviceType: 'Embassy',
          location: 'Indian High Commission, Colombo 3',
          contactNumber: '+94 11 242 1605',
          serviceHours: 'Mon-Fri, 9:00 AM - 5:30 PM'
        }
      ]
    },
    {
      title: 'Public Transport',
      subTopics: ['Bus', 'Trains'],
      details: [] 
    }
  ];
  