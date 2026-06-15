import { NextResponse } from "next/server"
import { sb } from "@/lib/supabase"

const sampleStories = [
  {
    title: "The Last Lighthouse",
    subtitle: "A story about hope in the darkest of times.",
    slug: "the-last-lighthouse",
    content: `<h2>Chapter One: The Light</h2>
<p>The lighthouse keeper had seen many storms, but none quite like this.</p>
<p>The waves crashed against the rocks with a fury that seemed almost personal, as if the ocean itself had decided that tonight, it would claim the shore for its own.</p>
<p>Elias stood at the top of the spiral staircase, his hand resting on the cold metal railing, watching the beam of light cut through the darkness every twelve seconds.</p>
<blockquote><p>"A lighthouse doesn't choose what it illuminates," his father had told him. "It simply shines."</p></blockquote>
<p>He thought about those words now, as the wind howled outside and the glass panes rattled in their frames. The light kept turning. Steady. Relentless.</p>
<h2>Chapter Two: The Letter</h2>
<p>It had arrived three days ago, tucked between a grocery bill and a postcard from a cousin who had moved to the city years ago. The envelope was plain, the handwriting unfamiliar.</p>
<p>But the message inside changed everything.</p>
<p><em>"We're tearing down the lighthouse. End of the month."</em></p>
<p>Elias had read the words five times before they sank in. The lighthouse had been standing for over a hundred years. It had survived wars, hurricanes, and the slow erosion of time itself. And now, a letter with three sentences was going to end it all.</p>`,
    excerpt: "The lighthouse keeper had seen many storms, but none quite like this.",
    category: "Fiction",
    tags: "fiction, lighthouse, hope, drama",
    wordCount: 245,
    readingTime: 2,
    published: true,
    featured: true,
  },
  {
    title: "Notes on Being",
    subtitle: "Reflections on existence and everyday wonder.",
    slug: "notes-on-being",
    content: `<p>There is a particular quality to the light at 5:47 PM in November that I have never been able to capture in a photograph.</p>
<p>It's amber. Soft. It falls across the room at an angle that makes everything look like a painting.</p>
<p>I have been thinking about what it means to be present. Not in the spiritual, self-help sense of the word, but in the actual, physical experience of occupying space and time.</p>
<h2>On Attention</h2>
<p>Simone Weil wrote that "attention is the rarest and purest form of generosity." I think about this when I catch myself scrolling, clicking, consuming. The world asks for our attention constantly, but rarely deserves it.</p>
<p>I've started practicing something I call "deep noticing." It's simple: pick something ordinary—a coffee cup, a leaf, the way light falls on a wall—and look at it for five full minutes. No phone. No music. Just looking.</p>
<h2>On Time</h2>
<p>Time moves differently now than it did when I was a child. Then, summer was an eternity. Now, months blur together like a train passing through a station without stopping.</p>
<p>Perhaps the measure of a life is not the number of years, but the number of moments we were truly awake for.</p>`,
    excerpt: "There is a particular quality to the light at 5:47 PM in November.",
    category: "Philosophy",
    tags: "philosophy, reflection, life, existence",
    wordCount: 320,
    readingTime: 2,
    published: true,
    featured: true,
  },
  {
    title: "Dreams of Violet Cities",
    subtitle: "A science fiction short about memory and identity.",
    slug: "dreams-of-violet-cities",
    content: `<p>The city of Aethel was built on the bones of a forgotten civilization, and if you listened closely, you could hear them whispering through the vents.</p>
<p>Lena walked through the violet-lit streets, her footsteps echoing against the chrome and glass. The sky was a permanent twilight, the result of atmospheric processors that had been running for three centuries.</p>
<h2>The Memory Markets</h2>
<p>In Aethel, memories were currency. People traded their most cherished moments for better apartments, faster transport, longer lives.</p>
<p>Lena had never sold hers. She was a memory hoarder, they said. A sentimental fool in a city that had no use for sentiment.</p>
<p>But she remembered things that others had forgotten. Things that might matter.</p>
<blockquote><p>"The past is not dead. It is not even past." — Faulkner, quoted on a wall in the Old Quarter</p></blockquote>
<h2>The Signal</h2>
<p>It came at midnight, as it always did. A frequency that only she could hear. A voice from before the collapse.</p>
<p><em>"Lena. Find the archive. Before they do."</em></p>
<p>She didn't know who "they" were. But she was about to find out.</p>`,
    excerpt: "The city of Aethel was built on the bones of a forgotten civilization.",
    category: "Science Fiction",
    tags: "scifi, memory, identity, future",
    wordCount: 410,
    readingTime: 3,
    published: true,
    featured: false,
  },
  {
    title: "A Walk in December",
    subtitle: "",
    slug: "a-walk-in-december",
    content: `<p>The air smells of pine and woodsmoke. My breath forms small clouds that dissolve almost instantly.</p>
<p>I walk along the path that runs behind the old houses, the ones with the peeling paint and the gardens gone wild. Someone is playing music from an open window—something classical, maybe Chopin.</p>
<p>It's the kind of cold that makes you feel alive. The kind that reminds you that you have a body, that you are here, that this moment is real.</p>
<p>I think about all the Decembers that came before this one. The people I was then. The things I believed. The way the world looked through younger eyes.</p>
<p>Somehow, the trees along this path have seen it all, and they keep standing. Keep growing. Keep shedding their leaves and growing new ones.</p>
<p>I want to be more like the trees.</p>`,
    excerpt: "The air smells of pine and woodsmoke. My breath forms small clouds.",
    category: "Personal",
    tags: "personal, winter, reflection, nature",
    wordCount: 180,
    readingTime: 1,
    published: true,
    featured: false,
  },
  {
    title: "The Space Between Heartbeats",
    subtitle: "On love, loss, and the quiet moments in between.",
    slug: "the-space-between-heartbeats",
    content: `<p>She left on a Tuesday. Not because Tuesday was significant, but because that's when the train came.</p>
<p>I stood on the platform and watched it carry her away, and I thought about how strange it is that people can occupy the same space for years and then suddenly be miles apart.</p>
<h2>The Geometry of Love</h2>
<p>Love is not a straight line. It's not even a circle. It's a chaotic, beautiful scribble that loops back on itself and never quite closes.</p>
<p>I used to think that loving someone meant holding on. Now I understand that sometimes it means letting go with such tenderness that your hands remember the shape of what they held.</p>
<h2>What Remains</h2>
<p>Months later, I found a book she had left behind. A worn copy of Neruda. The pages were dog-eared, passages underlined in faint pencil.</p>
<p>I read them all, one by one, as if they were letters addressed to me.</p>
<blockquote><p>"I love you without knowing how, or when, or from where."</p></blockquote>
<p>Some loves don't end. They just change shape.</p>`,
    excerpt: "She left on a Tuesday. Not because Tuesday was significant, but because that's when the train came.",
    category: "Love",
    tags: "love, loss, heartbreak, poetry",
    wordCount: 290,
    readingTime: 2,
    published: true,
    featured: false,
  },
  {
    title: "Echoes in the Attic",
    subtitle: "A horror story about the things we keep hidden.",
    slug: "echoes-in-the-attic",
    content: `<p>The house was old when we bought it, and the attic was the oldest part of all.</p>
<p>The realtor had called it "charming." She had not mentioned the sounds.</p>
<h2>The First Night</h2>
<p>It started as a whisper. Not words, exactly, but the shape of words—a rhythm, a cadence, the ghost of conversation. I told myself it was the pipes. Old houses made noises. Everyone knew that.</p>
<p>But the noises in our old house seemed to know things. They paused when I paused. They responded when I spoke.</p>
<p>One night, I heard my own voice coming from the attic. Reciting a poem I had written in high school and never shown anyone.</p>
<h2>The Box</h2>
<p>I found it behind a loose brick in the far wall. A wooden box, no larger than a shoebox, wrapped in rusted wire.</p>
<p>Inside: photographs. Dozens of them. All of the same woman. All of me.</p>
<p>But I had never been to this house before we bought it.</p>
<p>Or had I?</p>`,
    excerpt: "The house was old when we bought it, and the attic was the oldest part of all.",
    category: "Horror",
    tags: "horror, suspense, mystery, haunted",
    wordCount: 350,
    readingTime: 2,
    published: true,
    featured: false,
  },
]

export async function GET() {
  const { count: existing, error: countError } = await sb()
    .select("*", { count: "exact", head: true })

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if (existing && existing > 0) {
    return NextResponse.json({ message: "Database already has stories", count: existing })
  }

  const { error: insertError } = await sb()
    .insert(
      sampleStories.map((s) => ({
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    )

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Seeded successfully", count: sampleStories.length })
}
