"use client";

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const CounterOne = ({ data }) => {
    const counterData = data || DEFAULT_LANDING_DATA.counters;
    const items = Array.isArray(counterData.items) && counterData.items.length > 0
        ? counterData.items
        : DEFAULT_LANDING_DATA.counters.items;

    const { ref: counterRef, inView: counterInView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div className="counter-area-1 space-bottom shape-mockup-wrap" ref={counterRef}>
            <div
                className="section-animation-shape1-1 shape-mockup animation-infinite background-image"
                data-bottom="0"
                style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape2.png')", bottom: '0px' }}
            ></div>
            <div className="container">
                <div className="row justify-content-between gy-40">
                    {items.map((cnt, idx) => (
                        <div className="col-auto" key={idx}>
                            <div className="counter-card">
                                <h2 className="counter-card_number">
                                    <span className="counter-number">
                                        {counterInView && <CountUp start={0} end={cnt.number || 0} duration={2.5} />}
                                    </span>
                                    {cnt.suffix || '+'}
                                </h2>
                                <p className="counter-card_text">{cnt.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CounterOne;
