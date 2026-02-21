import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE, getToken, getUser, setUser } from "@/lib/auth";
import type { User } from "@/lib/auth";

interface ProfileData {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  dob?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "" as string | number,
    gender: "",
    height: "" as string | number,
    weight: "" as string | number,
    dob: "",
    bloodGroup: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) {
      navigate("/login", { replace: true });
      return;
    }
    setStoredUser(user);
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (json.success && json.data) {
          const d = json.data;
          setProfile(d);
          setFormData({
            fullName: d.fullName ?? "",
            email: d.email ?? "",
            age: d.age ?? "",
            gender: d.gender ?? "",
            height: d.height ?? "",
            weight: d.weight ?? "",
            dob: d.dob ? d.dob.slice(0, 10) : "",
            bloodGroup: d.bloodGroup ?? "",
            phoneNumber: d.phoneNumber ?? "",
          });
        } else {
          setProfile({ _id: user._id, username: user.username, email: user.email });
          setFormData((prev) => ({
            ...prev,
            email: user.email ?? "",
          }));
        }
      } catch {
        setProfile({ _id: user._id, username: user.username, email: user.email });
        setFormData((prev) => ({ ...prev, email: user.email ?? "" }));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, string | number | undefined> = {
        fullName: formData.fullName || undefined,
        email: formData.email || undefined,
        age: formData.age === "" ? undefined : Number(formData.age),
        gender: formData.gender || undefined,
        height: formData.height === "" ? undefined : Number(formData.height),
        weight: formData.weight === "" ? undefined : Number(formData.weight),
        dob: formData.dob || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        phoneNumber: formData.phoneNumber || undefined,
      };
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      const res = await fetch(`${API_BASE}/api/user/updateDetails`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Update failed");
      }
      if (data.data) {
        setProfile(data.data);
        setUser({
          _id: data.data._id,
          username: data.data.username,
          email: data.data.email,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !storedUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">View and update your details.</p>
        </div>

        {/* Sign-up details (read-only) */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Sign-up details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Username</Label>
              <p className="mt-1 font-medium">{storedUser.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email (at sign up)</Label>
              <p className="mt-1 font-medium">{storedUser.email}</p>
            </div>
          </div>
        </div>

        {/* Editable profile details */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Update your details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min={1}
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="170"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={1}
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bloodGroup">Blood group</Label>
              <Input
                id="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                placeholder="e.g. O+"
                className="mt-1.5"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
