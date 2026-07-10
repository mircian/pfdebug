# pfdebug — Copy (consolidated, final, v2-merged)

Every user-facing string. Use verbatim. `[bracketed slots]` are filled from the user's own values at render. Voice: plain verbs, second person, sentence case, numbers over adjectives, no exclamation marks, calm. This is the single source of truth for copy — nothing to reconcile against older docs.

Map from engine output → page: `D0` → §Referral · `D0_soft` → §Doesn't-match · `hedged:true` → prepend §Less-typical to the composed results · `D2_composed` → §Base plan + the relevant modules · `D5` → §Overload · `D4` → §No-clear-driver. Base plan (Ex1, Ex3, footwear note) renders for every route except D0 / D0_soft.

---

# Landing (`/`)

**New visitor — hero**
> **Find out what's actually driving your heel pain.**
> A 15-minute self-check. It runs the same movement tests a physio starts with, works out which factors are most likely behind *your* plantar fasciitis, and gives you a short plan of exercises backed by published trials. Free. No signup.
> [ Start the check ]
> *Evidence badges below the fold: study names — Rathleff 2015 · JOSPT 2023 guideline · Riddle 2003.*
> *Small print under the button:* This is a self-check, not a diagnosis, and it flags anything that means you should see a professional first.

**Returning visitor — hero** *(shown when `pfdebug.lastResult` exists)*
> **Welcome back.** Your plan is saved on this device.
> [ View my plan ]   [ Retest ]

---

# Wizard (`/assessment`)

## Step 0 — Before we start (intro)
> This is a self-check, not a diagnosis. It looks at how your foot and ankle move and points you toward what's most likely driving your heel pain — and it flags anything that means you should see a professional first. Nothing here is a substitute for a clinician. The exercises it may suggest are gentle and widely recommended, but if anything hurts sharply, stop.

**Q1 — Where is your pain?** (single)
Bottom of the heel, toward the inner edge · Bottom of the heel, dead center · Along the arch, toward the middle of the foot · Back of the heel / above the heel · Somewhere else / hard to pin down

**Q2 — When is it worst?** (multi)
First few steps in the morning · First steps after sitting a while · It eases once I get moving · It gets worse later in the day or after being active · It's constant, doesn't change much

**Q3 — Press your thumb into the inner part of your heel bone. What happens?** (single)
Sharp, tender spot right there — that's my pain · Tender, but not exactly the pain I feel walking · Nothing much

**Q4 — Safety checks. Do you have any of these?** (multi)
> These rule out things that look like plantar fasciitis but need a professional. Answer honestly — if any apply, the best thing we can do is point you to the right person.
Numbness, tingling, pins-and-needles, or burning in the foot · Pain at night, or pain at rest that isn't related to activity · The pain started after a fall, twist, or impact · Pain that gets steadily worse *during* activity until you have to stop · Both heels hurt, **and** I have morning stiffness in other joints too, or a diagnosed inflammatory condition · Fever, or unexplained recent weight loss, or a history of cancer · Diabetes with reduced feeling in my feet · The heel is visibly swollen or bruised · My pain is a steady 8/10 or higher · None of these

## Step 1 — Your story
> Plantar fasciitis usually has a trigger — something that changed a few weeks before it started. This helps us find yours.

**Q5 — How long have you had this?** (single) Less than 6 weeks · 6 weeks to 3 months · 3 to 12 months · Over a year

**Q6 — In the 2–6 weeks *before* the pain started, did any of these change?** (multi)
New shoes, or switched to flatter / less supportive shoes · A jump in running, walking, or training volume · A trip or event with a lot of walking / standing · Started a new job or routine that keeps me on my feet · Notable weight gain · A lot more barefoot time on hard floors · Nothing I can think of

**Q7 — On a normal day, how much are you on your feet?** (single) Mostly sitting · A mix · Mostly standing or walking

**Q9 — (Optional) Which band is your BMI in?** (single)
> We ask because higher body weight is one of the most consistent contributors in the research — it changes what we'd emphasize. Skip if you'd rather not.
Under 25 · 25–30 · Over 30 · Prefer not to say

**Q10 — Age band** (single) Under 40 · 40–54 · 55–69 · 70+

**Q11 — Which foot?** (single) Left · Right · Both

## Step 2 — Knee-to-wall test
> Stand facing a wall. Put the toes of one foot pointing straight at the wall, a few centimeters back from it. Keeping your heel flat on the floor — it must not lift — bend your knee forward and try to touch the wall with your knee.
> If your knee touches easily, slide that foot back and try again. If your heel lifts or your knee can't reach, slide in closer. Find the farthest-back spot where your knee still touches and your heel stays down. Measure from the tip of your big toe to the wall. Do both feet.

*Measurement helper:* Enter the distance for each foot. **No tape measure?** Pick your phone — [model dropdown] — and tell us how many phone-lengths, or use a bank card (8.56 cm each).

**End-feel (per foot):** At that farthest position, what did you feel most?
A stretch or pull in your calf or the back of your ankle · A pinch or block at the *front* of your ankle, where it folds · Nothing really — you just ran out of room / balance

## Step 3 — Single-leg heel raise
> Stand on one foot. Rest a couple of fingertips on a wall for balance only — don't push down on it. Rise up as high as you can onto the ball of your foot, then lower all the way down, slowly — about two seconds up, two seconds down. Count each one. Stop when you can't get as high as you did at the start, you can't keep the pace, your knee starts bending to cheat, or the pain goes past about 5 out of 10.
> We'll do your *good* side first, rest two minutes, then the painful side.

*Rep counter with opt-in visual/audio metronome (off by default). Enforced 2-minute rest between sides.*
*Skip control on the painful side:* Too sore to do this side today? [ Skip — I'll retest later ] *(records the flare; the plan still works)*

## Step 4 — Foot & footwear
**Wet footprint:** Wet the sole of your foot, step firmly onto a dry tile or paper, step off, and look. Which is it?
Full print — little or no gap on the inner side · A clear curve missing on the inner side (a normal arch) · Only a thin strip connects the ball and heel

**Shoe check:** Grab the pair you wear most. From behind: is the wear heavier on the inner edge? (yes / no / even) · Is the heel cushioning worn flat, or does the back collapse inward when you press it? (yes / no)

## End-of-assessment — persistence notice *(shown before redirect to `/plan`)*
> **Your results are saved on this device.** Next time you open pfdebug.com, your plan will be right here. To open it from another device, bookmark this link.
> [ See my plan ]

---

# Result pages (`/plan`)

## Referral (D0)
> **Let's get you to the right person first.**
> Your answers include something worth having a professional look at before you start any self-treatment — not necessarily because it's serious, but because it's outside what a self-check should handle. A few things can mimic plantar fasciitis: a nerve issue, a stress fracture, or an inflammatory condition, and each needs a different approach.
> **What to do:** see a GP, physiotherapist, or podiatrist. Tell them where your pain is, when it's worst, and [the flag they checked].
> This isn't a dead end — once that's ruled out, everything else here is still waiting for you.

## Doesn't match the pattern (D0_soft)
> **This might not be plantar fasciitis.**
> From what you've described, your pain doesn't quite fit the usual pattern — [e.g. "pain at the back of the heel points more toward the Achilles" / "your pain doesn't seem to spike on those first morning steps, which is the classic tell"]. This tool is built specifically for plantar fasciitis, so rather than send you down the wrong path, the honest move is to get it looked at. A physiotherapist or podiatrist can tell in one visit. If it turns out it *is* plantar fasciitis, come back — the check will be here.

## Less typical (prepended when `hedged:true`)
> One note before your results: your pain fits *some* of the plantar fasciitis pattern but not all of it. The plan below is still reasonable and completely safe to try, but if a few weeks of it doesn't move the needle, that's your cue to see someone in person rather than keep guessing.

## Base plan (D2 — every composed / D5 / D4 result)
> **Here's what we found — and what to do about it.**
> Plantar fasciitis isn't random. It shows up when the tissue on the bottom of your foot gets loaded harder than it can handle — and that's fixable, because the thing that protects it, your calf and the foot's own capacity, responds to training. The plan below is built on that. It's small on purpose: three movements, each backed by published trials, not a scattergun of twenty stretches.
> **The one rule that makes it work:** load beats rest. Resting calms an angry fascia for a morning, then it flares again on the next big day, because nothing got stronger. These exercises make the tissue tougher so ordinary days stop hurting. Expect the turnaround in weeks, not days — in the main study the strength group pulled clearly ahead by three months. Some ups and downs along the way are normal, not a sign it's failing.

### Exercise 1 — Heel raise with a towel under your toes *(everyone)*
> The exercise with the best evidence for plantar fasciitis. Rolling a towel under your toes bends them up, which loads the fascia itself along with your calf — so you strengthen the exact tissue that hurts.
> **How:** Roll a towel under your toes so they bend upward. Put the ball of that foot on the towel (progress to a step edge once comfortable). Rise up slowly onto your toes, pause at the top, lower slowly — **3 seconds up, 2-second hold, 3 seconds down.**
> **Dose:** Every second day — not daily; the tissue needs the day off to adapt. Start **3 sets of 12** both feet. When 12 is easy, add weight (a loaded backpack) and drop reps: **4 × 10, then 5 × 8.**
> **You should feel** your calf working hard; some heel awareness up to about 5/10 that settles within a day is fine. **Stop or ease off if** the pain is sharp, past 5/10, or worse the next morning.

### Exercise 3 — Plantar-fascia stretch *(everyone — the morning tool)*
> This buys you comfortable first steps. Done before you stand up in the morning, it takes the edge off the worst moment of the day.
> **How:** Sit down. Cross the painful foot over your other knee. Grab your toes and pull them back toward your shin until you feel a stretch along the arch — you can feel the tight band with your thumb. Hold **10 seconds, 10 times.**
> **Dose:** 3 times a day — and above all, **one round before your first steps out of bed.**

### Universal footwear note *(everyone, after the exercises)*
> Two small things both trial groups did: wear supportive shoes from your very first step in the morning — barefoot on hard floors first thing is when the fascia is most irritable — and a cheap gel heel cup or cushioned insole gives it a rest while it gets stronger.

---

## Modules (attached per engine flag)

### Capacity emphasis — pick the variant from `flags.capacity.label`

**`confirmed`:**
> **Why this is your priority:** your strength test showed [painful side X reps vs Y on the other side / below the Z benchmark for your age]. That gap is very likely the main thing keeping this going, and Exercise 1 is the direct fix. Track the number — watching it climb is how you'll know it's working before the pain even changes.

**`unconfirmed_bilateral`:**
> **About your calf strength:** both heels are affected, so we couldn't do the side-to-side comparison we normally rely on — there was no strong side to measure the weak one against[, and at your body weight the simple rep benchmark isn't a reliable yardstick either]. What we can say is both sides came in on the low side [around X reps]. We can't *confirm* a deficit cleanly, but Exercise 1 builds exactly the capacity that shields the fascia, so make it your anchor either way. Once one side settles enough to test properly, a side-to-side retest will give a clearer read.

**`suspected_skipped` / capacity skipped (renders as a note, never the headline):**
> **One thing we couldn't test today:** the calf strength on your painful side — the pain stopped you early, which is completely normal in a flare. [good side in range: Your other side came in within range [X reps], so there's no sign of a deficit; a proper comparison just waits until you can test the sore side.] [good side below floor: Even your unaffected side came in a bit under the benchmark [X], so some calf weakness is likely — worth confirming once things calm down.] Either way, Exercise 1 is strengthening both sides now. Retest the painful side when the flare settles.

### Exercise 2 — Knee-to-wall ankle mobilization *(only when `mobility.subtype === "soft_tissue"`)*
> Your ankle doesn't bend forward as far as it should [your [side] measured [X] cm; under about 10 cm is tight]. When the ankle is stiff, the foot flattens to make up the difference — and that overstretches the fascia every step. This loosens it, and it's the same movement you did as a test, so you already know it.
> **How:** Foot pointing at the wall, heel down, drive the knee forward over your toes toward the wall, then back. Slow, work the last comfortable bit of range, don't bounce. Do a version with the knee soft (targets the deeper calf muscle, usually the real limiter).
> **Dose:** 2 sets of 10–12 slow reps per side, daily.
> **Stop if** what you feel is a pinch at the *front* of the ankle rather than a stretch behind it.

### Mobility, joint sub-type — promoted headline *(when `headlineFactor === "mobility_joint_referral"`; Ex2 is NOT shown)*
> **Your ankle needs hands, not reps.** Your ankle doesn't bend forward as far as it should [your [side] measured [X] cm], but the **pinch at the front of the ankle** you felt — rather than a stretch behind it — points to the restriction being in the joint itself, not a tight muscle. That difference matters: joint restrictions respond to hands-on mobilization far better than to stretching, and this is the one thing on the whole site genuinely worth a professional's hands.
> **Your highest-value move is a single visit to a physiotherapist or podiatrist** to mobilize that ankle — often a quick fix in person and awkward to do well alone. You can try a few gentle knee-to-wall reps meanwhile, but if that front-of-ankle pinch keeps showing up, stop: that's your signal this needs hands, not reps.

### Load-management module *(when `loadSpike.set`, and the driver on a composed plan)*
> **What set this off:** you mentioned [their Q6 answer][if duration short: "and the pain started a few weeks later, the textbook lag — tissue injuries show up weeks after the thing that caused them"]. Naming the trigger tells you what to pull back on now.
> **What to do:** don't stop moving — just take the spike back out. Cut the specific thing that jumped [less of that / back to supportive shoes], keep everything else. Build back up slowly, a little each week rather than all at once.
> *(if `loadSpike.occupational`:)* Since you're on your feet most of the day, the footwear and insole part isn't optional for you — it does a lot of the work of protecting the tissue between sessions.

### Posture module *(when `posture.set`)*
> **Your arch:** your footprint / shoe wear points to [a foot that flattens under load / a high arch that doesn't absorb much / heavier wear on the inner edge]. That changes how force lands on the fascia. You can't change your foot's shape, but you can support it. A supportive shoe with a firm heel and some arch support does most of this; an off-the-shelf arch-support insole is a reasonable next step — no need for custom orthotics to start. If the simple version doesn't help in a few weeks, a podiatrist can say whether custom is worth it.

### Footwear-replace module *(when `footwear.set`)*
> **Your shoes:** the pair you checked is worn flat / the heel is collapsing. Dead shoes stop protecting the foot no matter how good your arch is — this alone can start heel pain. Replacing that pair may be the single easiest thing on this list.

### Weight module *(when `weightModule`)*
> **One more factor, plainly:** carrying extra weight is one of the most consistent contributors to plantar fasciitis in the research — every step lands harder on the fascia. This isn't about appearance and it's not a lecture; it's just that if weight comes down over time, the load on your foot comes down with it, and everything above works better. Keep it in the picture alongside the exercises, not instead of them.

### "Also worth addressing" — collapse block *(when the flag-cap trims items 4+)*
> **Also worth addressing** — smaller factors; the moves above matter most:
> - *(footwear-replace)* The pair of shoes you checked is worn out — replacing it is an easy, one-time win.
> - *(posture)* Your arch [flattens under load / is high]; an off-the-shelf arch-support insole is a reasonable add.
> - *(weight)* Extra body weight loads the fascia every step; as it comes down over time, everything here works better.

---

## Overload (D5 — contributor only, tissue clean)
> **Good news: nothing's broken. You did too much, too soon.**
> This isn't us waving your pain away — it's real, and it's worth fixing. It's us telling you the fix is simpler than you might have feared.
> Your tests came back clean across the board — [your calf held up: painful side X reps vs Y, both strong] · [your ankle bends fine: X cm] · [your arch and shoes are doing their job]. That matters, because it means the tissue on the bottom of your foot is healthy. What tipped it over was **load**: [their Q6 trigger][if duration short: ", and the pain showing up a few weeks later is the textbook lag"].
> Plantar fasciitis from a load spike is the best version to get: the fix isn't months of rehab for a weakness you don't have — it's managing the dose while the tissue settles, then building a bigger buffer so the next jump doesn't do this again.
> **What to do now:** take the spike back out — [less of the specific thing that jumped / back to your supportive shoes] — but keep moving; don't rest it into stiffness. When you build back up, add a little each week.
> **And to make it not happen again:** the two exercises below aren't fixing a fault — they're widening your margin. A stronger calf and a loaded fascia absorb a bigger jump before complaining.
*(then Base plan: Ex1 + Ex3 + footwear note. If footwear also flagged, elevate "replace your worn pair" into "what to do now".)*

## No-clear-driver (D4)
> **Good news, and an honest answer.**
> Your tests came back clean: your calf strength is solid [X reps], your ankle moves well [X cm], your arch and shoes look fine — **and** nothing in your history points to a specific trigger. That's genuinely good; the usual suspects aren't your problem.
> It also means a self-check has taken you as far as it usefully can. When every obvious driver is clear *and* there's no load spike to explain it, the answer is usually something that needs eyes on you moving — how you walk or run, or something further up the chain at the hip. That's a gait assessment, and it's exactly what a physiotherapist or podiatrist does.
> The plan below is still safe and still worth doing. But if it doesn't shift things in a few weeks, book the assessment rather than keep self-testing — you've already done the triage they'd start with. Bring these numbers.
*(then Base plan.)*

---

# Retest mode (`/assessment?mode=retest`) & result deltas
- Pre-fill prior scores; show each test's new value beside the old on the same ruler gauge (delta pointer state).
- Improvement moment copy (e.g.): **Left calf: [old] → [new] reps in [weeks] weeks.** Offer the share card here.

# Share strings
**Share pfdebug (help-others; zero personal data; after value only):**
> This is a 15-minute self-check for heel pain — it works out what's actually driving it and gives you three exercises. Free, no signup. pfdebug.com
*Prompt line at end of plan:* Someone you know is quietly limping through their mornings right now. Send them the check.
*Prevalence line (verified — always frame as lifetime):* Roughly 1 in 10 people get plantar heel pain at some point in their life.

**Share my plan (utility; on `/plan`; carries the payload):**
> Button: *Share my plan* · Label: This link contains your results.

# Print sheet
- Header: `pfdebug` wordmark. Your values printed into the doses. Exercises as keyframe strips. Blank line: **Retest on: ____.** QR to your plan URL, bottom-right. Footer: **Know someone with morning heel pain? pfdebug.com**

# Legal / disclaimer (footer + `/legal`)
> pfdebug is an educational self-check, not a medical diagnosis or treatment. It doesn't replace a qualified clinician. The exercises are widely recommended and gentle, but if anything causes sharp or worsening pain, stop and see a professional. If you have any of the warning signs we ask about, see a clinician before starting.
