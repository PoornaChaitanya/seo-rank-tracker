import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
  try {
    let result;

    // Try up to 2 times for reliability
    for (let attempt = 1; attempt <= 2; attempt++) {
      result = await rankTracker(tracking.keyword, tracking.domain);
      if (result.success && result.data && result.data.totalResultsScanned > 0)
        break;
      if (attempt < 2) {
        await new Promise((r) =>
          setTimeout(r, result && result.success ? 3000 : 5000),
        );
      }
    }

    if (result && result.success) {
      const prev = tracking.currentPosition;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newPos = result.data.position ?? null;

      tracking.currentPosition = newPos;
      tracking.currentPage = result.data.page ?? null;
      tracking.competitors = result.data.competitors || [];
      tracking.lastChecked = new Date();
      tracking.status = "completed";

      // Update stats
      tracking.positionChange =
        prev != null && newPos != null ? prev - newPos : 0;

      if (
        newPos != null &&
        (tracking.bestPosition == null || newPos < tracking.bestPosition)
      ) {
        tracking.bestPosition = newPos;
      }

      // Update history
      const historyEntry = {
        date: today,
        position: newPos,
        page: result.data.page ?? null,
        title: result.data.title || "",
        snippet: result.data.snippet || "",
      };

      if (!Array.isArray(tracking.rankHistory)) tracking.rankHistory = [];

      const idx = tracking.rankHistory.findIndex(
        (h) => new Date(h.date).toDateString() === today.toDateString(),
      );

      if (idx >= 0) {
        tracking.rankHistory[idx] = historyEntry;
      } else {
        tracking.rankHistory.push(historyEntry);
      }
    } else {
      tracking.status = "failed";
    }

    await tracking.save();
    return result;
  } catch (err) {
    console.error("Rank update error:", err?.message || err);
    try {
      tracking.status = "failed";
      await tracking.save();
    } catch (e) {
      // ignore
    }
    return { success: false, error: err?.message || String(err) };
  }
}
