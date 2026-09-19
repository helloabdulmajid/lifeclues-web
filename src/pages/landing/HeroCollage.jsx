import {
  BotanicalSprig,
  CoffeeScene,
  HeartDoodle,
  MountainsScene,
  SiennaUnderline,
  SunDoodle,
  TapePiece,
} from './art'
import { DateLabel, MoodPill, PersonTag, PlaceTag } from './kit'

export default function HeroCollage() {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[520px] select-none sm:h-[500px]">
      {/* hand-drawn note, top-right */}
      <div className="absolute right-2 top-4 z-10 rotate-2 sm:right-6 sm:top-6">
        <div className="lc-float-slow">
          <div className="w-[150px] rounded-xl border border-lnd-line bg-lnd-card p-3 shadow-[0_16px_32px_-18px_rgba(33,27,17,0.3)]">
            <p className="font-caveat text-lg leading-snug text-lnd-ink">
              Remember the way she laughs. The little things stay.
            </p>
            <SiennaUnderline className="mt-1 h-2 w-16" />
            <DateLabel className="mt-2 block">a note to me</DateLabel>
          </div>
          <TapePiece className="absolute -top-2 right-6 w-14" />
        </div>
      </div>

      {/* mountain polaroid, top-left */}
      <div className="absolute left-0 top-10 z-0 -rotate-3 sm:left-4 sm:top-16">
        <div className="lc-float">
          <figure className="w-[132px] rounded-xl border border-lnd-line bg-lnd-card p-2 shadow-[0_14px_30px_-16px_rgba(33,27,17,0.28)] sm:w-[148px]">
            <div className="overflow-hidden rounded-lg">
              <MountainsScene boat className="h-20 w-full" />
            </div>
            <figcaption className="mt-2 px-1 font-caveat text-lg leading-none text-lnd-ink">
              the drive up
            </figcaption>
            <DateLabel className="ml-1 mt-1 block">09.08.26</DateLabel>
          </figure>
        </div>
      </div>

      {/* coffee polaroid, right */}
      <div className="absolute right-0 top-1/2 z-10 rotate-2 sm:right-4">
        <div className="lc-float">
          <figure className="w-[132px] rounded-xl border border-lnd-line bg-lnd-card p-2 shadow-[0_14px_30px_-16px_rgba(33,27,17,0.28)] sm:w-[148px]">
            <div className="overflow-hidden rounded-lg">
              <CoffeeScene openBook className="h-20 w-full" />
            </div>
            <figcaption className="mt-2 px-1 font-caveat text-lg leading-none text-lnd-ink">
              coffee and ideas
            </figcaption>
            <DateLabel className="ml-1 mt-1 block">12.09.26</DateLabel>
            <div className="absolute -bottom-2 right-4">
              <TapePiece className="w-12" />
            </div>
          </figure>
        </div>
      </div>

      {/* main memory card */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rotate-1">
        <div className="lc-float-slow">
          <figure className="w-[260px] rounded-2xl border border-lnd-line bg-lnd-card p-3 shadow-[0_18px_40px_-18px_rgba(33,27,17,0.25)] sm:w-[300px]">
            <div className="overflow-hidden rounded-xl">
              <MountainsScene boat className="h-36 w-full sm:h-44" />
            </div>
            <div className="mt-3 px-1 pb-1">
              <figcaption className="font-caveat text-2xl text-lnd-ink">A quiet morning</figcaption>
              <p className="mt-1 text-xs leading-relaxed text-lnd-mut">
                Mist over the lake, coffee cooling on the railing, the day still wide open.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <MoodPill mood="chill" />
                <PersonTag>Mom</PersonTag>
                <PlaceTag>Bangalore</PlaceTag>
                <DateLabel className="ml-auto">14.09.26</DateLabel>
              </div>
            </div>
          </figure>
          <TapePiece className="absolute -top-2 left-8 w-20" />
        </div>
      </div>

      {/* small doodles */}
      <SunDoodle className="absolute -left-2 top-0 z-0 hidden size-9 sm:block" />
      <HeartDoodle className="absolute bottom-6 right-1 z-10 size-4 text-[#b4501e] sm:right-20" />
      <BotanicalSprig className="absolute -left-1 bottom-2 z-0 w-14 rotate-180 text-lnd-mut sm:left-2 sm:w-16" />
      <DateLabel className="absolute bottom-3 left-1/2 z-0 hidden -translate-x-1/2 sm:block">
        private · just you
      </DateLabel>
    </div>
  )
}