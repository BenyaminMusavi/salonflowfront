"use client";

import { useEffect, useRef } from "react";

/**
 * روی موبایل، اسکرول افقی با لمس ذاتاً کار می‌کند. روی دسکتاپ اما، چون اسکرول‌بار
 * عمداً مخفی است (کلاس `no-scrollbar`)، بدون این هوک هیچ راهی برای اسکرول کردن با
 * ماوس نبود — این هوک با گرفتن و کشیدن (drag) توسط ماوس، همون تجربه رو شبیه‌سازی می‌کند.
 * برای touch/pen دخالتی نمی‌کند تا رفتار بومی اسکرول لمسی مرورگر دست‌نخورده بماند.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      // در این پروژه چیدمان RTL است و مرورگرها برای اسکرول RTL از قرارداد
      // scrollLeft منفی استفاده می‌کنند (۰ = ابتدای محتوا/سمت راست)، پس برخلاف
      // فرمول معمول LTR («startScrollLeft - dx») اینجا باید جمع شود، وگرنه هر
      // درگ به یک مقدار مثبت نامعتبر می‌رسد که مرورگر آن را به صفر کلمپ می‌کند.
      el.scrollLeft = startScrollLeft + dx;
    };

    // یک درگ واقعی نباید کلیک زیر انگشت/ماوس را هم شلیک کند (وگرنه انتخاب دسته‌بندی
    // اشتباه هنگام رها کردن دراگ تریگر می‌شود)، برای همین یک کلیک ساختگی روی خودِ
    // فرزندِ هدف را در فاز capture خنثی می‌کنیم — فقط وقتی واقعاً جابه‌جایی رخ داده باشد.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    el.addEventListener("click", onClickCapture, true);
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return ref;
}
