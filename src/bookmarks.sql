drop table if exists bookmarks;

create table bookmarks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    rating INTEGER DEFAULT 3,
    desc text
);

insert into bookmarks (title, url, rating, desc)
values
    ('Google', 'www.google.com', 5, 'A search engine'),
    ('Gmail', 'www.gmail.com', 5 'Google Email'),
    ('Instagram', 'www.instagram.com', 4, 'Look at pics'),
    ('Facebook', 'wwww.facebook.com', 2, 'Keep in touch with family'),
    ('Reddit', 'www.reddit.com', 5, 'The frontpage of the internet'),
    ('Gear Patrol', 'www.gearpatrol.com', 4, 'Look at stuff you dont need'),
    ('Bless This Stuff', 'www.blessthisstuff.com', 5, 'Look at expensive stuff you dont need'),
    ('Styleforum', 'www.styleforum.net', 4, 'A place for clothing nerds'),
    ('eBay', 'www.ebay.com', 3, 'bid on things'),
    ('Netflix', 'www.netflix.com', 4, 'watch tv/movies');