import { useState } from 'react'

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    profileId: '',
    age: '',
    gender: '',
    birthDate: '',
    bloodGroup: '',
    height: '',
    weight: '',
  })

  const [formData, setFormData] = useState(profileData)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = () => {
    setProfileData(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(profileData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Header */}
      <div className="rounded-2xl border border-[rgba(17,24,39,0.12)] bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#BB243E] to-[#8B1A2E] flex items-center justify-center text-white text-2xl font-bold">
              {profileData.name ? profileData.name.charAt(0) : '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">{profileData.name || 'User Profile'}</h1>
              <p className="text-sm text-[#6B7280]">{profileData.username || '@username'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditing(!isEditing)
              if (isEditing) {
                setFormData(profileData)
              }
            }}
            className="rounded-xl border border-[rgba(17,24,39,0.12)] px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#f3f4f6]"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Form/View */}
      <div className="rounded-2xl border border-[rgba(17,24,39,0.12)] bg-white p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#111827]">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.name || '-'}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.username || '-'}</p>
            )}
          </div>

          {/* Profile ID */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Profile ID
            </label>
            {isEditing ? (
              <input
                type="text"
                name="profileId"
                placeholder="Enter your profile ID"
                value={formData.profileId}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.profileId || '-'}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Age
            </label>
            {isEditing ? (
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.age || '-'}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Gender
            </label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#BB243E]/30"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-[#111827]">{profileData.gender || '-'}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Birth Date
            </label>
            {isEditing ? (
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.birthDate || '-'}</p>
            )}
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Blood Group
            </label>
            {isEditing ? (
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#BB243E]/30"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="text-[#111827]">{profileData.bloodGroup || '-'}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Height (cm)
            </label>
            {isEditing ? (
              <input
                type="number"
                name="height"
                placeholder="Enter height in cm"
                value={formData.height}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.height || '-'}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Weight (kg)
            </label>
            {isEditing ? (
              <input
                type="number"
                name="weight"
                placeholder="Enter weight in kg"
                value={formData.weight}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            ) : (
              <p className="text-[#111827]">{profileData.weight || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#BB243E]/30 disabled:opacity-50 disabled:pointer-events-none h-11 px-4 text-sm bg-[#BB243E] text-white hover:brightness-95"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#6B7280]/30 disabled:opacity-50 disabled:pointer-events-none h-11 px-4 text-sm bg-transparent border border-[rgba(17,24,39,0.12)] text-[#111827] hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
