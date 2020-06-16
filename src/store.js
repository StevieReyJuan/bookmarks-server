const { v4: uuid } = require('uuid');

const bookmarks = [
    {
      id: uuid(),
      title: 'Google',
      url: 'https://www.google.com',
      rating: '3',
      description: 'Internet-related services and products.'
    },
    {
      id: '1',
      title: 'Thinkful',
      url: 'https://www.thinkful.com',
      rating: '5',
      description: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
    },
    {
      id: '2',
      title: 'Github',
      url: 'https://www.github.com',
      rating: '4',
      description: 'brings together the world\'s largest community of developers.'
    }
];

module.exports = { bookmarks }