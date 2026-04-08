import { useAquariumApp } from "./hooks/useAquariumApp.js";
import { AquariumGlobalStyles } from "./components/app/AquariumGlobalStyles.jsx";
import { AmbientLayers } from "./components/app/AmbientLayers.jsx";
import { LandingStep } from "./components/app/LandingStep.jsx";
import { SetupStep } from "./components/app/SetupStep.jsx";
import { ResultsStep } from "./components/app/ResultsStep.jsx";
import { StockingStep } from "./components/app/StockingStep.jsx";
import { StockFloatBubble } from "./components/app/StockFloatBubble.jsx";

export default function AquariumStockr() {
  const a = useAquariumApp();

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Avenir Next', 'Segoe UI', sans-serif",
      color: "#e0f0ff",
      position: "relative",
      overflow: "hidden",
    }}>
      <AquariumGlobalStyles />

      <AmbientLayers
        step={a.step}
        isMobile={a.isMobile}
        fishPool={a.fishPool}
        fishRefs={a.fishRefs}
        bubbleRefs={a.bubbleRefs}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: a.isMobile ? "0 16px" : "0 24px" }}>

        {a.step === 0 && (
          <LandingStep
            fadeIn={a.fadeIn}
            isMobile={a.isMobile}
            onStart={() => a.setStep(1)}
          />
        )}

        {a.step === 1 && (
          <SetupStep
            fadeIn={a.fadeIn}
            catalogStatus={a.catalogStatus}
            onBack={() => a.setStep(0)}
            onFindSpecies={() => {
              a.setStep(2);
              a.setTypeFilter("all");
              a.setDiffFilter("all");
              a.setSelectedSpecies(null);
            }}
            waterType={a.waterType}
            setWaterType={a.setWaterType}
            setPh={a.setPh}
            tankSize={a.tankSize}
            setTankSize={a.setTankSize}
            dimMode={a.dimMode}
            setDimMode={a.setDimMode}
            tankL={a.tankL}
            setTankL={a.setTankL}
            tankW={a.tankW}
            setTankW={a.setTankW}
            tankH={a.tankH}
            setTankH={a.setTankH}
            showParams={a.showParams}
            setShowParams={a.setShowParams}
            temp={a.temp}
            setTemp={a.setTemp}
            ph={a.ph}
            gh={a.gh}
            kh={a.kh}
            setGh={a.setGh}
            setKh={a.setKh}
          />
        )}

        {a.step === 2 && (
          <ResultsStep
            resultsRef={a.resultsRef}
            fadeIn={a.fadeIn}
            isMobile={a.isMobile}
            setStep={a.setStep}
            setTypeFilter={a.setTypeFilter}
            setDiffFilter={a.setDiffFilter}
            setSelectedSpecies={a.setSelectedSpecies}
            setStockTypeFilter={a.setStockTypeFilter}
            waterType={a.waterType}
            tankSize={a.tankSize}
            temp={a.temp}
            ph={a.ph}
            gh={a.gh}
            kh={a.kh}
            chemistryFilterActive={a.chemistryFilterActive}
            catalogStatus={a.catalogStatus}
            catalogErrorDetail={a.catalogErrorDetail}
            setCatalogReloadTick={a.setCatalogReloadTick}
            catalogReady={a.catalogReady}
            matchingSetups={a.matchingSetups}
            speciesDb={a.speciesDb}
            popularPicks={a.popularPicks}
            compatible={a.compatible}
            typeFilter={a.typeFilter}
            diffFilter={a.diffFilter}
            selectedSpecies={a.selectedSpecies}
            visibleCompatible={a.visibleCompatible}
            matchesHasMore={a.matchesHasMore}
            setMatchesVisibleCount={a.setMatchesVisibleCount}
            readyToStockAnchorRef={a.readyToStockAnchorRef}
          />
        )}

        {a.step === 3 && (
          <StockingStep
            fadeIn={a.fadeIn}
            isMobile={a.isMobile}
            setStep={a.setStep}
            waterType={a.waterType}
            tankSize={a.tankSize}
            tankCapacity={a.tankCapacity}
            catalogStatus={a.catalogStatus}
            catalogErrorDetail={a.catalogErrorDetail}
            setCatalogReloadTick={a.setCatalogReloadTick}
            catalogReady={a.catalogReady}
            stockList={a.stockList}
            speciesDb={a.speciesDb}
            compatible={a.compatible}
            stockTypeFilter={a.stockTypeFilter}
            setStockTypeFilter={a.setStockTypeFilter}
            totalBioload={a.totalBioload}
            bioloadPct={a.bioloadPct}
            bioloadOver={a.bioloadOver}
            bioloadPctAtCap={a.bioloadPctAtCap}
            tankBioloadPct={a.tankBioloadPct}
            formatCappedBioloadPct={a.formatCappedBioloadPct}
            stockStatus={a.stockStatus}
            barColor={a.barColor}
            getCount={a.getCount}
            setStockCount={a.setStockCount}
            removeAllFromStock={a.removeAllFromStock}
            addToStock={a.addToStock}
          />
        )}
      </div>

      {a.step === 2 && a.showStockFloatBubble && (
        <StockFloatBubble
          isMobile={a.isMobile}
          onReadyToStock={() => { a.setStep(3); a.setStockTypeFilter("all"); }}
        />
      )}
    </div>
  );
}
