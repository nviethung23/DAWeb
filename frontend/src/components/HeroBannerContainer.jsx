import React, { useEffect, useState } from "react";
import HeroBanner from "./HeroBanner";

export default function HeroBannerContainer({ movie }) {
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [prevMovie, setPrevMovie] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!movie || movie.id === currentMovie?.id) return;

    setPrevMovie(currentMovie);
    setCurrentMovie(movie);
    setTransitioning(true);

    const timeout = setTimeout(() => {
      setPrevMovie(null);
      setTransitioning(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [movie]);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {prevMovie && <HeroBanner movie={prevMovie} fadeOut />}
      {currentMovie && <HeroBanner movie={currentMovie} fadeIn={!transitioning} />}
    </div>
  );
}
