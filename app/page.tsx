'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { siteConfig } from './site-config';

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatConvertedPrice(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    GBP: '£',
    EUR: '€',
    CAD: 'C$',
    AUD: 'A$',
    SGD: 'S$',
    AED: 'AED ',
    CHF: 'CHF ',
    HKD: 'HK$',
  };
  const formatted = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(amount);
  return `${symbols[currency] ?? `${currency} `}${formatted}${currency === 'AED' || currency === 'CHF' ? '' : ` ${currency}`}`;
}

type ConvertedPricing = {
  gbp: string;
  eur: string;
  cad: string;
  aud: string;
  sgd: string;
  aed: string;
  chf: string;
  hkd: string;
};

type LiveRates = {
  result?: string;
  rates?: Record<string, number>;
};

const LIVE_RATES_URL = 'https://open.er-api.com/v6/latest/USD';

function fallbackPricing(): ConvertedPricing {
  return {
    gbp: siteConfig.priceFallbacks.GBP,
    eur: siteConfig.priceFallbacks.EUR,
    cad: siteConfig.priceFallbacks.CAD,
    aud: siteConfig.priceFallbacks.AUD,
    sgd: siteConfig.priceFallbacks.SGD,
    aed: siteConfig.priceFallbacks.AED,
    chf: siteConfig.priceFallbacks.CHF,
    hkd: siteConfig.priceFallbacks.HKD,
  };
}

function pricingFromRates(rates: Record<string, number>): ConvertedPricing | null {
  const currencies = ['GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'AED', 'CHF', 'HKD'];
  if (currencies.some((currency) => !rates[currency])) return null;

  return {
    gbp: formatConvertedPrice(siteConfig.priceUsdAmount * rates.GBP, 'GBP'),
    eur: formatConvertedPrice(siteConfig.priceUsdAmount * rates.EUR, 'EUR'),
    cad: formatConvertedPrice(siteConfig.priceUsdAmount * rates.CAD, 'CAD'),
    aud: formatConvertedPrice(siteConfig.priceUsdAmount * rates.AUD, 'AUD'),
    sgd: formatConvertedPrice(siteConfig.priceUsdAmount * rates.SGD, 'SGD'),
    aed: formatConvertedPrice(siteConfig.priceUsdAmount * rates.AED, 'AED'),
    chf: formatConvertedPrice(siteConfig.priceUsdAmount * rates.CHF, 'CHF'),
    hkd: formatConvertedPrice(siteConfig.priceUsdAmount * rates.HKD, 'HKD'),
  };
}

function AudioControl() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    void attemptAutoplay();
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="audio-control">
      <audio
        ref={audioRef}
        preload="metadata"
        autoPlay
        src={siteConfig.audioFile}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        className="audio-button"
        type="button"
        aria-label={isPlaying ? `Pause ${siteConfig.audioLabel}` : `Play ${siteConfig.audioLabel}`}
        aria-pressed={isPlaying}
        onClick={togglePlayback}
      >
        <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
      </button>
      <span className="audio-time" aria-live="polite">
        {isPlaying ? formatTime(currentTime) : duration ? formatTime(duration) : siteConfig.durationHint}
      </span>
    </div>
  );
}

export default function Home() {
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const [isIntroReady, setIsIntroReady] = useState(false);
  const [pricing, setPricing] = useState<ConvertedPricing>(fallbackPricing);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsIntroReady(true), 680);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadRates = async () => {
      try {
        const response = await fetch(LIVE_RATES_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as LiveRates;
        if (data.result !== 'success' || !data.rates) return;

        const nextPricing = pricingFromRates(data.rates);
        if (nextPricing) setPricing(nextPricing);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') return;
      }
    };

    void loadRates();
    const refreshTimer = window.setInterval(loadRates, 6 * 60 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (!isSaleOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSaleOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSaleOpen]);

  return (
    <main className="site-shell" aria-busy={!isBackgroundReady || !isIntroReady}>
      <Image
        className="background-image"
        src={siteConfig.backgroundImage}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        onLoad={() => setIsBackgroundReady(true)}
        onError={() => setIsBackgroundReady(true)}
      />
      <div className="background-overlay" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className={isBackgroundReady && isIntroReady ? 'loading-screen is-hidden' : 'loading-screen'} aria-hidden="true">
        <div className="loading-mark">
          <span>{siteConfig.name}</span>
          <i />
        </div>
      </div>

      <div className="site-identity">
        <h1>{siteConfig.name}</h1>
        <AudioControl />
      </div>

      {isSaleOpen && (
        <div className="sale-overlay" role="presentation" onMouseDown={() => setIsSaleOpen(false)}>
          <button
            ref={closeButtonRef}
            className="close-button"
            type="button"
            aria-label="Close sale details"
            onClick={() => setIsSaleOpen(false)}
          >
            ×
          </button>
        </div>
      )}

      <div className={isSaleOpen ? 'sale-stage is-open' : 'sale-stage'}>
        <button
          className="sale-link"
          type="button"
          aria-expanded={isSaleOpen}
          onClick={() => setIsSaleOpen((value) => !value)}
        >
          <span className="sale-label-closed">for sale</span>
          <span className="sale-label-open">{siteConfig.domain}</span>
        </button>

        <section className="sale-details" aria-hidden={!isSaleOpen}>
          <p className="sale-price">{siteConfig.priceUsd}</p>
          <div className="sale-conversions" aria-live="polite">
            <p>≈ {pricing.gbp} · {pricing.eur}</p>
            <p>{pricing.cad} · {pricing.aud}</p>
            <p>{pricing.sgd} · {pricing.aed}</p>
            <p>{pricing.chf} · {pricing.hkd}</p>
          </div>
          <p className="sale-negotiation">{siteConfig.negotiationNote}</p>
          <a className="inquiries-link" href={`mailto:${siteConfig.inquiriesEmail}`} tabIndex={isSaleOpen ? 0 : -1}>
            {siteConfig.inquiriesEmail}
          </a>
        </section>
      </div>
    </main>
  );
}
