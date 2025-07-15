from __future__ import annotations
"""Utility to plot standardized A350 traces for multiple samples.

Revision history
----------------
* **v1.2** – added title / subtitle.
* **v1.3** – tightened spacing and reduced title sizes.
* **v1.4** – new *y_label* parameter so callers can override the default
  y‑axis label (was fixed to ``A_{350}``).
"""

import datetime as dt
from typing import Any, Iterable

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# ───────────────────────── helper utilities ──────────────────────────

def _series_to_rel_minutes(series: pd.Series) -> tuple[np.ndarray, float, dt.time]:
    """Convert an absolute-time Series to minutes-since-start plus metadata."""
    first = series.iloc[0]

    # pandas / numpy datetime64
    if isinstance(first, pd.Timestamp) or np.issubdtype(series.dtype, np.datetime64):
        ts = pd.to_datetime(series)
        rel = (ts - ts.iloc[0]).dt.total_seconds() / 60.0
        return rel.to_numpy(), float(rel.iat[-1]), ts.iloc[0].time()

    # native ``datetime.time``
    if isinstance(first, dt.time):
        secs = series.apply(lambda t: t.hour * 3600 + t.minute * 60 + t.second)
        rel = (secs - secs.iloc[0]) / 60.0
        return rel.to_numpy(), float(rel.iat[-1]), first

    # strings "HH:MM[:SS]"
    try:
        ts = pd.to_datetime(series, format="%H:%M:%S", errors="raise")
    except ValueError:
        ts = pd.to_datetime(series, format="%H:%M", errors="coerce")
    if ts.notna().all():
        rel = (ts - ts.iloc[0]).dt.total_seconds() / 60.0
        return rel.to_numpy(), float(rel.iat[-1]), ts.iloc[0].time()

    # numeric fallback
    rel = pd.to_numeric(series, errors="coerce") - pd.to_numeric(series.iloc[0])
    return rel.to_numpy(), float(rel.iat[-1]), dt.time(0, 0)


def _add_minutes(t: dt.time, minutes: float) -> dt.time:
    total = (t.hour * 60 + t.minute + minutes) % (24 * 60)
    h, m = divmod(int(round(total)), 60)
    return dt.time(h, m)


def _fmt(t: dt.time) -> str:
    return t.strftime("%H:%M")

# ────────────────────────── main plotting API ─────────────────────────

def plot_stdized_samples(
    samples: Iterable[Any],
    *,
    time_col: str = "Time",
    cmap_name: str = "tab10",
    dot_size: int = 3,
    figsize: tuple[int, int] = (15, 4),
    font: str | None = None,
    title: str | None = None,
    subtitle: str | None = None,
    y_label: str = r"$A_{350}$",
):
    """Plot *standardised* A₃₅₀ traces for a collection of *Sample* objects.

    Parameters
    ----------
    y_label : str, default ``"$A_{350}$"``
        Text to display on the y‑axis. Supply any string (including LaTeX math
        wrapped in ``$...$``) to override the default.
    """
    # ― global font family (optional) ―───────────────────────────────
    if font is not None:
        plt.rcParams["font.family"] = font

    samples = list(samples)
    if not samples:
        raise ValueError("`samples` is empty")

    cmap = plt.get_cmap(cmap_name)
    fig, ax = plt.subplots(figsize=figsize)

    # ────────────────────── layout bookkeeping ───────────────────────
    x_offset = 0.0
    divider_pos, centre_pos = [], []
    legend_handles: list[Any] = []
    tick_pos, tick_lab = [], []

    for idx, sample in enumerate(samples):
        df_val = sample.stdized_diff_sample()
        if isinstance(df_val, pd.Series):
            df_val = df_val.to_frame(name=df_val.name or getattr(sample, "background_well", "val"))
        df_raw = sample.dataframe

        # relative minutes axis
        if time_col in df_raw.columns:
            rel_min, duration, t0 = _series_to_rel_minutes(df_raw[time_col])
        else:
            rel_min = df_val.index.to_numpy(dtype=float)
            duration = float(rel_min[-1] - rel_min[0])
            t0 = dt.time(0, 0)

        # plot replicates
        colour = cmap(idx % cmap.N)
        for col in df_val.columns:
            ax.plot(rel_min + x_offset, df_val[col].to_numpy(), ".", ms=dot_size, color=colour)
        legend_handles.append(ax.plot([], [], ".", ms=8, color=colour, label=sample.sample_name)[0])

        # hour ticks
        hour_marks = np.arange(0, duration + 0.1, 60)
        tick_pos.extend(x_offset + hour_marks)
        tick_lab.extend([_fmt(_add_minutes(t0, h)) for h in hour_marks])

        centre_pos.append(x_offset + duration / 2)
        x_offset += duration
        if idx < len(samples) - 1:
            divider_pos.append(x_offset)

    total_span = x_offset

    # ────────────────────── cosmetics ────────────────────────────────
    for xb in divider_pos:
        ax.axvline(xb, color="k", linewidth=1, zorder=0)
    ax.axhline(0, linestyle=":", color="k", linewidth=1.0)
    for sp in ("left", "bottom"):
        ax.spines[sp].set_linewidth(2.0)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # x-axis ticks & labels
    ax.set_xlim(0, total_span)
    ax.set_xticks(tick_pos)
    ax.set_xticklabels(tick_lab, fontweight="bold", fontsize=9)

    # per-sample labels beneath traces
    for xc, samp in zip(centre_pos, samples):
        ax.text(xc, -0.08, samp.sample_name, transform=ax.get_xaxis_transform(),
                ha="center", va="top", fontweight="bold")

    # global Time label
    try:
        fig.supxlabel("Time", y=0.03, fontsize=12, fontweight="bold")
    except AttributeError:
        fig.text(0.5, 0.03, "Time", ha="center", va="bottom", fontsize=12, fontweight="bold")

    # y-axis label (now user‑controllable)
    ax.set_ylabel(y_label, fontsize=12, fontweight="bold")

    # legend
    ax.legend(handles=legend_handles, frameon=False, bbox_to_anchor=(1.02, 0.5), loc="center left")

    # ────────────────────── titles (adjusted) ────────────────────────
    if title:
        fig.suptitle(title, fontsize=18, fontweight="bold", y=0.86)
    if subtitle:
        fig.text(0.5, 0.8, subtitle, ha="center", va="top", fontweight="bold", fontsize=14)

    # tighten layout
    fig.subplots_adjust(bottom=0.20, top=0.88)
    fig.tight_layout(rect=(0, 0, 1, 0.88))

    return fig, ax
