"use client";

import { useEffect } from "react";
import niceSelect from "react-nice-select";

const ContactDropdownTwo = () => {
  useEffect(() => {
    niceSelect();
  }, []);

  const defaultValue = 'Pilih Layanan Konsultasi';
  const options = [
    { value: 'Desain Arsitektur & 3D Render', label: 'Jasa Desain Arsitektur & 3D' },
    { value: 'Pembangunan & Renovasi', label: 'Renovasi & Bangun Rumah Baru' },
    { value: 'Perhitungan RAB & Rencana Kerja', label: 'Perhitungan RAB & Rencana Kerja' },
    { value: 'Pengurusan Izin PBG (Yogyakarta)', label: 'Pengurusan Izin PBG (Yogyakarta)' },
    { value: 'Konsultasi Lainnya', label: 'Konsultasi Proyek Lainnya' }
  ];

  return (
    <div className="col-12">
      <div className="form-group custom-form-design">
        <select
          name="subject"
          id="subject"
          className="single-select nice-select form-select"
          defaultValue=""
        >
          <option className="select-style" value="" disabled hidden>
            {defaultValue}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ContactDropdownTwo;
