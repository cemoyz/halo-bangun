"use client";

import { useEffect } from "react";
import niceSelect from "react-nice-select";

const NiceSelectDropDown = () => {
  useEffect(() => {
    niceSelect();
  }, []);
  return (
    <div className="form-group">
      <select
        name="subject"
        id="subject"
        className="single-select nice-select form-select"
        defaultValue=""
      >
        <option value="" disabled hidden>
          Pilih Layanan Konsultasi
        </option>
        <option value="Desain Arsitektur & 3D">Desain Arsitektur & 3D</option>
        <option value="Renovasi & Bangun">Renovasi & Bangun</option>
        <option value="Perhitungan RAB">Perhitungan RAB</option>
        <option value="Pengurusan Izin PBG">Pengurusan Izin PBG</option>
      </select>
    </div>
  );
};

export default NiceSelectDropDown;
