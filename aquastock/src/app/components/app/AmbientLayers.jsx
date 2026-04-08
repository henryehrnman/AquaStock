import { Bubble, SwimmingFish } from "../ambient/AmbientAquariumDecor.jsx";

export function AmbientLayers({ step, isMobile, fishPool, fishRefs, bubbleRefs }) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {fishPool.current.map((f, i) => (
          <SwimmingFish
            key={i}
            parallaxRef={el => fishRefs.current[i] = el}
            size={f.size} top={f.top} duration={f.duration} delay={f.delay}
            direction={f.direction} opacity={f.opacity}
          />
        ))}
      </div>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Bubble parallaxRef={el => bubbleRefs.current[0] = el} style={{ width: 80,  height: 80,  top: "10%", left: "5%"   }} />
        <Bubble parallaxRef={el => bubbleRefs.current[1] = el} style={{ width: 40,  height: 40,  top: "30%", right: "8%"  }} />
        <Bubble parallaxRef={el => bubbleRefs.current[2] = el} style={{ width: 120, height: 120, bottom: "15%", left: "12%" }} />
        <Bubble parallaxRef={el => bubbleRefs.current[3] = el} style={{ width: 60,  height: 60,  top: "60%", right: "15%" }} />
        <Bubble parallaxRef={el => bubbleRefs.current[4] = el} style={{ width: 35,  height: 35,  top: "80%", left: "40%"  }} />
        <Bubble parallaxRef={el => bubbleRefs.current[5] = el} style={{ width: 90,  height: 90,  top: "5%",  right: "30%" }} />
        {step === 2 && !isMobile && <>
          <Bubble parallaxRef={el => bubbleRefs.current[6]  = el} style={{ width: 70,  height: 70,  top: "20%",  right: "22%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[7]  = el} style={{ width: 100, height: 100, top: "45%",  left: "3%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[8]  = el} style={{ width: 45,  height: 45,  top: "70%",  right: "35%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[9]  = el} style={{ width: 85,  height: 85,  top: "15%",  left: "30%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[10] = el} style={{ width: 110, height: 110, top: "88%",  right: "5%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[11] = el} style={{ width: 30,  height: 30,  top: "55%",  left: "55%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[12] = el} style={{ width: 55,  height: 55,  top: "110%", left: "8%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[13] = el} style={{ width: 95,  height: 95,  top: "130%", right: "12%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[14] = el} style={{ width: 40,  height: 40,  top: "150%", left: "45%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[15] = el} style={{ width: 75,  height: 75,  top: "170%", right: "28%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[16] = el} style={{ width: 115, height: 115, top: "190%", left: "2%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[17] = el} style={{ width: 50,  height: 50,  top: "210%", right: "42%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[18] = el} style={{ width: 80,  height: 80,  top: "230%", left: "20%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[19] = el} style={{ width: 35,  height: 35,  top: "250%", right: "5%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[20] = el} style={{ width: 100, height: 100, top: "270%", left: "35%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[21] = el} style={{ width: 60,  height: 60,  top: "290%", right: "18%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[22] = el} style={{ width: 45,  height: 45,  top: "320%", left: "60%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[23] = el} style={{ width: 90,  height: 90,  top: "350%", right: "8%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[24] = el} style={{ width: 70,  height: 70,  top: "380%", left: "15%" }} />
        </>}
      </div>

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,229,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,176,255,0.02) 0%, transparent 50%)",
      }} />
    </>
  );
}
