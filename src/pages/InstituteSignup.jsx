// src/pages/InstituteSignup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2 } from "lucide-react"; // npm install lucide-react
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function InstituteSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1, 2, or 3
  const role = "institute";
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const inputStyle =
    "w-full border border-orange-200  p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all";

  // ✅ Agreement state (NEW)
  // ✅ Loading state (NEW)
  const [loading, setLoading] = useState(false);

  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    instituteName: "",
    organizationType: "",
    founderName: "",
    designation: "",
    certifications: [],
    category: "",
    subCategory: "",
    yearFounded: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    zipCode: "",
    city: "",
    state: "",
    building: "",
    street: "",
    landmark: "",
    district: "",
    country: "",

    // Step 3
    bankDetails: "",
    upiDetails: "",

  });
  const categories = [
    "Martial Arts",
    "Team Ball Sports",
    "Racket Sports",
    "Fitness",
    "Target & Precision Sports",
    "Equestrian Sports",
    "Adventure & Outdoor Sports",
    "Ice Sports",
    "Wellness",
    "Dance",
  ];

  const subCategoryMap = {
    "Martial Arts": [
      "Karate",
      "Taekwondo",
      "Boxing",
      "Wrestling",
      "Fencing",
      "Kendo",
    ],
    "Team Ball Sports": [
      "Football",
      "Hockey",
      "Basketball",
      "Handball",
      "Rugby",
      "American Football",
      "Water Polo",
      "Lacrosse",
    ],
    "Racket Sports": [
      "Tennis",
      "Badminton",
      "Pickleball",
      "Soft Tennis",
      "Padel Tennis",
      "Speedminton",
    ],
    Fitness: [
      "Strength / Muscular Fitness",
      "Muscular Endurance",
      "Flexibility Fitness",
      "Balance & Stability",
      "Skill / Performance Fitness",
    ],
    "Target & Precision Sports": [
      "Archery",
      "Shooting",
      "Darts",
      "Bowling",
      "Golf",
      "Billiards",
      "Bocce",
      "Lawn",
    ],
    "Equestrian Sports": [
      "Dressage",
      "Show Jumping",
      "Eventing",
      "Cross Country",
      "Endurance Riding",
      "Polo",
      "Horse Racing",
      "Para-Equestrian",
    ],
    "Adventure & Outdoor Sports": [
      "Rock Climbing",
      "Trekking",
      "Camping",
      "Kayaking",
      "Paragliding",
      "Surfing",
      "Mountain Biking",
      "Ziplining",
    ],
    "Ice Sports": [
      "Ice Skating",
      "Figure Skating",
      "Ice Hockey",
      "Speed Skating",
      "Short Track Skating",
      "Ice Dancing",
      "Curling",
      "Synchronized Skating",
    ],
    Wellness: [
      "Physical Wellness",
      "Mental Wellness",
      "Social Wellness",
      "Emotional Wellness",
      "Spiritual Wellness",
      "Lifestyle Wellness",
    ],
    Dance: [
      "Classical Dance",
      "Contemporary Dance",
      "Hip-Hop Dance",
      "Folk Dance",
      "Western Dance",
      "Latin Dance",
      "Fitness Dance",
      "Creative & Kids Dance",
    ],
  };
  const handleCertificateChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      certifications: files,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category: selectedCategory,
      subCategory: "", // reset when category changes
    }));
  };
  const handleSubCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      subCategory: e.target.value,
    }));
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  // Validation for each step
  const validateStep = () => {
    if (step === 1) {
      if (!profileImageFile) {
        alert("Please upload institute logo");
        return false;
      }
      if (
        !formData.instituteName ||
        !formData.founderName ||
        !formData.designation ||
        !formData.yearFounded ||
        !formData.category ||
        !formData.subCategory ||
        !formData.phoneNumber ||
        !formData.email
      ) {
        alert("Please fill all fields in Step 1");
        return false;
      }
      if (!formData.password || !formData.confirmPassword) {
        alert("Please enter password");
        return false;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return false;
      }

      if (!formData.certifications || formData.certifications.length === 0) {
        alert("Please upload at least one certification or licence");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert("Please enter a valid email");
        return false;
      }

      return true;
    }


    if (step === 2) {
      if (
        !formData.building ||
        !formData.street ||
        !formData.city ||
        !formData.district ||
        !formData.state ||
        !formData.country ||
        !formData.zipCode
      ) {
        alert("Please fill all required address fields");
        return false;
      }
      return true;
    }


    if (step === 3) {
      return true;
    }

  };

  const handleNext = () => {
    if (!validateStep()) return;

    // require agreement before leaving step 1
    if (step === 1 && !agreed) {
      alert("Please agree to policies to continue");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };
  // ✅ Upload Profile Image to Cloudinary
  const uploadProfileToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    // ✅ Your Unsigned Preset
    formData.append("upload_preset", "kridana_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/daiyvial8/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      alert("Image upload failed!");
      return "";
    }
  };
  const uploadCertificatesToCloudinary = async (files) => {
    const urls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "kridana_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/daiyvial8/image/upload",
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();
      urls.push(data.secure_url);
    }

    return urls;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!agreed) {
      alert("Please agree to Kridhana policies to continue");
      return;
    }

    // ✅ Start loading
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const uid = userCredential.user.uid;

      let profileImageUrl = "";

      if (profileImageFile) {
        profileImageUrl = await uploadProfileToCloudinary(profileImageFile);
      }
      let certificateUrls = [];

      if (formData.certifications?.length) {
        certificateUrls = await uploadCertificatesToCloudinary(
          formData.certifications
        );
      }


      await setDoc(doc(db, "institutes", uid), {
        role: "institute",
        status: "pending",

        // Step 1
        instituteName: formData.instituteName,
        organizationType: formData.organizationType,
        founderName: formData.founderName,
        designation: formData.designation,
        yearFounded: formData.yearFounded,
        category: formData.category,
        subCategory: formData.subCategory,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        certifications: certificateUrls,

        // Step 2
        building: formData.building,
        street: formData.street,
        landmark: formData.landmark || "",
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,

        // Step 3
        bankDetails: formData.bankDetails || "",
        upiDetails: formData.upiDetails || "",

        // Profile Image
        profileImageUrl,

        // Agreements
        agreements: {
          termsAndConditions: true,
          privacyPolicy: true,
          paymentPolicy: true,
          merchantPolicy: true,
          agreedAt: serverTimestamp(),
        },

        createdAt: serverTimestamp(),
      });

      alert("Institute registered successfully!");
      navigate("/login?role=institute");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login instead.");
        navigate("/login?role=institute");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert("Something went wrong: " + error.message);
      }
    } finally {
      // ✅ Stop loading (always)
      setLoading(false);
    }
  };

  // Progress bar width
  const progressPercentage = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Step 0{step}</h2>
          </div>
          <button
            onClick={() => navigate("/login?role=institute")}
            className="mt-10 text-orange-400 text-lg font-bold transition-transform duration-300 hover:scale-105 hover:text-orange-500"
          >
            Institute Sign In
          </button>


        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              {/* ===== LOGO UPLOAD (TOP like image) ===== */}
              <div className="flex flex-col items-center justify-center gap-4">


                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Logo</span>
                  )}
                </div>

                <label className="cursor-pointer border border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>

                {profileImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImageFile(null);
                    }}
                    className="text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>


              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-semibold mb-2">Institute Name*</label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Founder Name*</label>
                  <input
                    type="text"
                    name="founderName"
                    value={formData.founderName}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Designation*</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Year Founded*</label>
                  <input
                    type="number"
                    name="yearFounded"
                    value={formData.yearFounded}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Certifications / Licence*</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCertificateChange}
                    className={inputStyle}
                  />

                  <p className="text-sm text-gray-500 mt-1">
                    Upload certification or licence images
                  </p>
                </div>

                {/* Category + Sub Category – SAME ROW */}
                <div>
                  <label className="block font-semibold mb-2">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className={inputStyle}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                </div>

                <div>
                  <label className="block font-semibold mb-2">Sub Category*</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleSubCategoryChange}
                    disabled={!formData.category}
                    className={inputStyle}
                  >
                    <option value="">Select Sub Category</option>

                    {formData.category &&
                      subCategoryMap[formData.category]?.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>

                </div>


                <div>
                  <label className="block font-semibold mb-2">Phone Number*</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
                {/* Password */}
                <div>
                  <label className="block font-semibold mb-2">Create Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Re-Enter Password*</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>


              </div>
            </div>
          )}


          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-xl font-bold text-gray-900 pb-2">
                Add Address
              </h3>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Building / Flat / Door Number *
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street / Area / Locality *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN / ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

              </div>
            </div>

          )}
          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <p className="text-red-500 pb-2">
                You can add your institute&apos;s bank details
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Details (Optional)
                  </label>
                  <input
                    type="text"
                    name="bankDetails"
                    value={formData.bankDetails}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI Details (Optional)
                  </label>
                  <input
                    type="text"
                    name="upiDetails"
                    value={formData.upiDetails}
                    onChange={handleChange}
                   className={inputStyle}
                  />
                </div>

              </div>
            </div>
          )}

          {/* ✅ AGREEMENT SECTION */}
          <div className="flex items-start gap-2 text-sm text-gray-700 mt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <p>
              I agree to the{" "}
              <span
                onClick={() => navigate("/terms")}
                className="text-blue-600 underline cursor-pointer"
              >
                Terms & Conditions
              </span>
              ,{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="text-blue-600 underline cursor-pointer"
              >
                Privacy Policy
              </span>
              ,{" "}
              <span
                onClick={() => navigate("/paymentpolicy")}
                className="text-blue-600 underline cursor-pointer"
              >
                Payment & Merchant Policy
              </span>
              .
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
            )}

            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Next
              </button>
            )}

            {step === 3 && (
              <button
                type="submit"
                disabled={!agreed || loading}
                className={`flex-1 p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${agreed && !loading
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {loading ? (
                  <>
                    <span className="loader"></span>
                    Registering...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
