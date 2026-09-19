import { Link } from 'react-router-dom'
import { FlowerDoodle } from './art'
import { GithubMark, LinkedinMark, XMark } from './social'
import BrandLockup from '../../ui/BrandLockup'

export default function LandingFooter() {
  return (
    <footer className="border-t border-lnd-line bg-lnd-deep/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <BrandLockup />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-lnd-mut">
              A private journal for the little moments that make a life.
            </p>
            <p className="mt-5 flex items-center gap-1.5 font-caveat text-xl text-lnd-ink">
              Every clue matters.
              <FlowerDoodle className="size-6" />
            </p>
          </div>

          <div className="font-plxmono text-[11px] uppercase tracking-[0.16em]">
            <p className="text-lnd-faint">Explore</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#about" className="text-lnd-mut transition-colors hover:text-lnd-ink">
                  About
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-lnd-mut transition-colors hover:text-lnd-ink">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-lnd-mut transition-colors hover:text-lnd-ink">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-lnd-mut transition-colors hover:text-lnd-ink">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-plxmono text-[11px] uppercase tracking-[0.16em] text-lnd-faint">
              Find me
            </p>
            <div className="mt-3 flex gap-2.5">
              <a
                href="https://github.com/helloabdulmajid"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex size-10 items-center justify-center rounded-full border border-lnd-line bg-lnd-card text-lnd-mut transition-colors hover:text-lnd-ink"
              >
                <GithubMark className="size-4" />
              </a>
              <a
                href="#about"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-full border border-lnd-line bg-lnd-card text-lnd-mut transition-colors hover:text-lnd-ink"
              >
                <LinkedinMark className="size-4" />
              </a>
              <a
                href="#about"
                aria-label="X"
                className="flex size-10 items-center justify-center rounded-full border border-lnd-line bg-lnd-card text-lnd-mut transition-colors hover:text-lnd-ink"
              >
                <XMark className="size-4" />
              </a>
            </div>
            <p className="mt-5 font-plxmono text-[10px] uppercase tracking-[0.16em] text-lnd-faint">
              © 2026 LifeClues · made with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}