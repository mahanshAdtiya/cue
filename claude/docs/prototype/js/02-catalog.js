'use strict';

const CATALOG = [
  { id:'dark', name:'Dark', type:'TV Show', year:2017, hue:265, seasons:3, eps:26, genres:'Sci-fi · Mystery · Thriller', overview:'A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations.' },
  { id:'severance', name:'Severance', type:'TV Show', year:2022, hue:198, seasons:2, eps:19, genres:'Sci-fi · Drama', overview:'Employees at a biotech firm undergo a procedure that surgically divides their work memories from their personal ones.' },
  { id:'vinland', name:'Vinland Saga', type:'Anime', year:2019, hue:32, seasons:2, eps:48, genres:'Action · Historical', overview:'A young Viking raised on revenge slowly learns what it costs to be a warrior, and what it might mean to stop.' },
  { id:'onepiece', name:'One Piece', type:'Anime', year:1999, hue:12, seasons:21, eps:1100, genres:'Adventure · Fantasy', overview:'A crew of pirates chases a legendary treasure across an ocean of islands, marines and impossible weather.' },
  { id:'interstellar', name:'Interstellar', type:'Movie', year:2014, hue:220, seasons:0, eps:1, genres:'Sci-fi · Drama', overview:'With Earth failing, a pilot leaves his children behind to look for a home for humanity on the other side of a wormhole.' },
  { id:'arcane', name:'Arcane', type:'TV Show', year:2021, hue:290, seasons:2, eps:18, genres:'Animation · Drama', overview:'Two sisters end up on opposite sides of a war between a gleaming city and the undercity it is built on.' },
  { id:'breakingbad', name:'Breaking Bad', type:'TV Show', year:2008, hue:110, seasons:5, eps:62, genres:'Crime · Drama', overview:'A chemistry teacher with a terminal diagnosis starts cooking meth, and finds he is unnervingly good at it.' },
  { id:'frieren', name:'Frieren', type:'Anime', year:2023, hue:170, seasons:1, eps:28, genres:'Fantasy · Drama', overview:'An elf mage outlives the party she saved the world with, and sets out to learn what she never bothered to understand about people.' },
  { id:'pastlives', name:'Past Lives', type:'Movie', year:2023, hue:18, seasons:0, eps:1, genres:'Romance · Drama', overview:'Two childhood friends reunite in New York twenty years after her family emigrated from Korea.' },
  { id:'chernobyl', name:'Chernobyl', type:'TV Show', year:2019, hue:78, seasons:1, eps:5, genres:'Drama · History', overview:'The story of the 1986 nuclear disaster and the people who were sent in to measure, contain and explain it.' },
  { id:'shogun', name:'Shogun', type:'TV Show', year:2024, hue:8, seasons:1, eps:10, genres:'Drama · History', overview:'An English sailor shipwrecked in feudal Japan becomes a pawn in a succession crisis he barely understands.' },
  { id:'monster', name:'Monster', type:'Anime', year:2004, hue:242, seasons:1, eps:74, genres:'Thriller · Mystery', overview:'A brilliant surgeon saves a boy on the operating table, then spends years chasing the man that boy became.' },
  { id:'zone', name:'The Zone of Interest', type:'Movie', year:2023, hue:96, seasons:0, eps:1, genres:'Drama · History', overview:'A commandant and his wife build an idyllic domestic life next to the wall of Auschwitz.' },
  { id:'steinsgate', name:'Steins;Gate', type:'Anime', year:2011, hue:340, seasons:1, eps:24, genres:'Sci-fi · Thriller', overview:'A self-styled mad scientist discovers his microwave can send text messages into the past, then learns what that costs.' },
  { id:'fleabag', name:'Fleabag', type:'TV Show', year:2016, hue:352, seasons:2, eps:12, genres:'Comedy · Drama', overview:'A woman navigating grief, family and London tells you exactly what she thinks of all of it.' },
  { id:'whiplash', name:'Whiplash', type:'Movie', year:2014, hue:44, seasons:0, eps:1, genres:'Drama · Music', overview:'A drummer at an elite conservatory meets an instructor who believes cruelty is the price of greatness.' },
  { id:'succession', name:'Succession', type:'TV Show', year:2018, hue:212, seasons:4, eps:39, genres:'Drama · Comedy', overview:'The children of an ageing media mogul circle the company, and each other, waiting for him to let go.' },
  { id:'spirited', name:'Spirited Away', type:'Movie', year:2001, hue:150, seasons:0, eps:1, genres:'Animation · Fantasy', overview:'A sullen girl stumbles into a bathhouse for spirits and has to work her way back out.' },
  { id:'cowboybebop', name:'Cowboy Bebop', type:'Anime', year:1998, hue:200, seasons:1, eps:26, genres:'Sci-fi · Action', overview:'Bounty hunters drift between planets, chasing money they will spend immediately and pasts they cannot outrun.' },
  { id:'thebear', name:'The Bear', type:'TV Show', year:2022, hue:6, seasons:3, eps:28, genres:'Drama · Comedy', overview:'A fine-dining chef inherits his brother\u2019s chaotic sandwich shop in Chicago.' },
  { id:'aftersun', name:'Aftersun', type:'Movie', year:2022, hue:186, seasons:0, eps:1, genres:'Drama', overview:'A woman revisits camcorder footage of a holiday with her young father in Turkey.' },
  { id:'mrrobot', name:'Mr. Robot', type:'TV Show', year:2015, hue:132, seasons:4, eps:45, genres:'Thriller · Drama', overview:'A cybersecurity engineer with a talent for hacking is recruited by an anarchist collective.' }
];

const STATUSES = { want:'Want to watch', watching:'Currently watching', watched:'Watched' };
const KEY = 'cue.v1';
const RECENTS_KEY = 'cue.recentSearches';

/* ───────── store ───────── */
