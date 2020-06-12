function makeBookmarksArray() {
    return [
        {
          id: '1',
          title: 'Google',
          url: 'https://www.google.com',
          rating: '3',
          desc: 'Internet-related services and products.'
        },
        {
          id: '2',
          title: 'Thinkful',
          url: 'https://www.thinkful.com',
          rating: '5',
          desc: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
        },
        {
          id: '2',
          title: 'Github',
          url: 'https://www.github.com',
          rating: '4',
          desc: 'brings together the world\'s largest community of developers.'
        }
    ];
}

module.exports = {
    makeBookmarksArray
}