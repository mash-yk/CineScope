import "dotenv/config";
import mongoose from "mongoose";
import Movie from "../backend/models/Movie.js";
import User from "../backend/models/User.js";

function r(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function makeReviews(authorId, title, min = 3.5, max = 5.0) {
  return [
    { user: authorId, name: "Seeder", rating: r(min, max), comment: `Great movie: ${title}!` },
    { user: authorId, name: "Seeder", rating: r(min, max), comment: `Loved the pacing in ${title}.` },
  ];
}

function doc(title, year, genres = ["Drama"], cast = [], detailNote = "seeded entry") {
  return (authorId) => ({
    name: title,
    year,
    image: `https://dummyimage.com/600x900/222/fff.jpg&text=${encodeURIComponent(title)}`,
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    genres,
    cast,
    detail: `${title} (${year}) — ${detailNote}.`,
    reviews: makeReviews(authorId, title),
  });
}

const BUILDERS = [
  doc("The Godfather Part II", 1974, ["Crime", "Drama"]),
  doc("Schindler's List", 1993, ["History", "Drama"]),
  doc("12 Angry Men", 1957, ["Drama"]),
  doc("The Good, the Bad and the Ugly", 1966, ["Western"]),
  doc("The Empire Strikes Back", 1980, ["Action", "Adventure", "Sci-Fi"]),
  doc("One Flew Over the Cuckoo's Nest", 1975, ["Drama"]),
  doc("Psycho", 1960, ["Horror", "Thriller"]),
  doc("Rear Window", 1954, ["Mystery", "Thriller"]),
  doc("Seven Samurai", 1954, ["Action", "Drama"]),
  doc("City Lights", 1931, ["Comedy", "Romance"]),
  doc("Raiders of the Lost Ark", 1981, ["Action", "Adventure"]),
  doc("The Shining", 1980, ["Horror"]),
  doc("Apocalypse Now", 1979, ["War", "Drama"]),
  doc("The Terminator", 1984, ["Sci-Fi", "Action"]),
  doc("Aliens", 1986, ["Sci-Fi", "Action"]),
  doc("The Thing", 1982, ["Horror", "Sci-Fi"]),
  doc("The Princess Bride", 1987, ["Fantasy", "Adventure", "Romance"]),
  doc("Das Boot", 1981, ["War", "Drama", "Thriller"]),
  doc("Once Upon a Time in the West", 1968, ["Western"]),
  doc("Grave of the Fireflies", 1988, ["Animation", "War", "Drama"]),
  doc("Spirited Away", 2001, ["Animation", "Fantasy"]),                 
  doc("Howl's Moving Castle", 2004, ["Animation", "Fantasy"]),
  doc("Princess Mononoke", 1997, ["Animation", "Fantasy"]),
  doc("Your Name.", 2016, ["Animation", "Romance"]),
  doc("Inglourious Basterds", 2009, ["War", "Drama"]),
  doc("The Lives of Others", 2006, ["Thriller", "Drama"]),
  doc("Amadeus", 1984, ["Drama", "Music"]),
  doc("Cinema Paradiso", 1988, ["Drama", "Romance"]),
  doc("The Hunt", 2012, ["Drama"]),
  doc("L\u00e9on: The Professional", 1994, ["Crime", "Drama"]),
  doc("The Truman Show", 1998, ["Drama"]),                               
  doc("Memento", 2000, ["Mystery", "Thriller"]),
  doc("The Usual Suspects", 1995, ["Crime", "Mystery"]),                 
  doc("The Big Lebowski", 1998, ["Comedy", "Crime"]),
  doc("The Sixth Sense", 1999, ["Mystery", "Thriller"]),
  doc("Eternal Sunshine of the Spotless Mind", 2004, ["Romance", "Drama", "Sci-Fi"]),
  doc("The Prestige", 2006, ["Drama", "Mystery", "Sci-Fi"]),             
  doc("Children of Men", 2006, ["Sci-Fi", "Drama"]),
  doc("No Country for Old Men", 2007, ["Crime", "Thriller"]),            
  doc("There Will Be Blood", 2007, ["Drama"]),                           
  doc("The Social Network", 2010, ["Drama"]),                            
  doc("Black Swan", 2010, ["Drama", "Thriller"]),
  doc("Drive", 2011, ["Crime", "Drama"]),
  doc("The Avengers", 2012, ["Action", "Adventure", "Sci-Fi"]),
  doc("Hereditary", 2018, ["Horror", "Drama"]),
  doc("Get Out", 2017, ["Horror", "Thriller"]),
  doc("Logan", 2017, ["Action", "Drama"]),
  doc("Inside Out", 2015, ["Animation", "Family"]),
  doc("Coco", 2017, ["Animation", "Family"]),                          
  doc("Finding Nemo", 2003, ["Animation", "Adventure"]),
  doc("The Incredibles", 2004, ["Animation", "Action"]),
  doc("WALL·E", 2008, ["Animation", "Sci-Fi"]),                        
  doc("Up", 2009, ["Animation", "Adventure"]),                         
  doc("Toy Story 2", 1999, ["Animation", "Adventure"]),
  doc("Ratatouille", 2007, ["Animation", "Comedy"]),
  doc("Monsters, Inc.", 2001, ["Animation", "Comedy"]),
  doc("The Iron Giant", 1999, ["Animation", "Adventure"]),
  doc("Whiplash", 2014, ["Drama", "Music"]),                      
  doc("Prisoners", 2013, ["Thriller", "Crime"]),
  doc("The Handmaiden", 2016, ["Thriller", "Romance"]),
  doc("Oldboy", 2003, ["Thriller"]),                                   
  doc("The Grand Budapest Hotel", 2014, ["Comedy", "Drama"]),          
  doc("La La Land", 2016, ["Romance", "Drama"]),                        
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cineScope");
  let author = (await User.findOne({ isAdmin: true })) || (await User.findOne({}));
  if (!author) {
    author = await User.create({
      name: "Seeder",
      email: "seeder@example.com",
      password: "Seeder123!",
    });
  }

  for (const build of BUILDERS) {
    const m = build(author._id);
    // skip if same name+year already present
    const exists = await Movie.findOne({ name: m.name, year: m.year });
    if (exists) continue;

    // compute and set aggregates
    const numReviews = m.reviews?.length || 0;
    const avgRating =
      numReviews > 0
        ? Math.round(
            (m.reviews.reduce((s, rr) => s + Number(rr.rating || 0), 0) / numReviews) * 10
          ) / 10
        : 0;

    const created = await Movie.create({ ...m, numReviews, avgRating });
    console.log("Inserted:", created.name);
  }

  console.log("✅ More popular movies seeded");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
