'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
    {
        id: 1,
        alt: "Great Republic Day Sale",
        content: (
            <div className="w-full h-full relative overflow-hidden bg-[#e3e6e6]">
                {/* Background with Amazon specific color vibe */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffc266] to-[#e67a00] opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                    <div className="text-center transform transition-transform hover:scale-105 duration-700">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-2 text-white drop-shadow-md tracking-wide uppercase">Great Republic Day Sale</h2>
                        <p className="text-xl md:text-3xl font-bold mb-4 text-white drop-shadow-sm">Starting ₹49 | Home, Kitchen & Outdoors</p>
                        <button className="bg-[#232f3e] text-white px-8 py-3 rounded-sm font-bold shadow-lg hover:bg-[#37475a] transition-all">Explore Deals</button>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        alt: "Latest Electronics",
        content: (
            <div className="w-full h-full relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                {/* Tech-inspired decorative elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/20 blur-3xl rounded-full translate-x-1/2"></div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-white">
                    <h2 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">Latest Electronics</h2>
                    <p className="text-2xl md:text-4xl font-light mb-6 text-blue-200">Up to 40% Off</p>
                    <button className="bg-[#febd69] text-gray-900 px-8 py-2 rounded-sm font-bold hover:bg-[#f3a847] shadow-lg transition-colors">Shop Now</button>
                </div>
            </div>
        )
    },
    {
        id: 3,
        alt: "Fashion Festival",
        content: (
            <div className="w-full h-full relative overflow-hidden bg-[#84104d]">
                {/* Elegant gradient for fashion */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#84104d] via-[#b31b66] to-[#6a0d3e]"></div>
                <div className="absolute inset-0 bg-black/20"></div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-white">
                    <span className="uppercase tracking-[0.2em] text-sm md:text-base font-bold mb-2 opacity-90">New Arrivals</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 italic">Fashion Festival</h2>
                    <p className="text-lg md:text-xl opacity-90 mb-6">Clothing, Shoes & Accessories</p>
                </div>
            </div>
        )
    }
];

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] bg-gray-200 overflow-hidden group">
            {/* Slides Container */}
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {CAROUSEL_IMAGES.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative">
                        {slide.content}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded hover:border-2 hover:border-white focus:outline-none transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded hover:border-2 hover:border-white focus:outline-none transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
            >
                <ChevronRight className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
            </button>
        </div>
    );
}
