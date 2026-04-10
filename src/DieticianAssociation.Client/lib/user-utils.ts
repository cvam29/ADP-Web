// Helper functions
export function getRoleName(role: number): string {
  switch (role) {
    case 0: return 'Student'
    case 1: return 'Super Admin'
    case 2: return 'Admin'    
    default: return 'Unknown'
  }
}

export function getMembershipTierName(tier: number): string {
  switch (tier) {
    case 0: return 'Student'
    case 1: return 'Professional'
    case 2: return 'Premium'
    default: return 'N/A'
  }
}

export function getMembershipStatusName(status: number): string {
  switch (status) {
    case 0: return 'Pending'
    case 1: return 'Active'
    case 2: return 'Expired'
    case 3: return 'Suspended'
    default: return 'Unknown'
  }
}

export function getMembershipStatusColor(status: number): string {
  switch (status) {
    case 0: return 'bg-yellow-100 text-yellow-800' // Pending
    case 1: return 'bg-green-100 text-green-800'   // Active
    case 2: return 'bg-red-100 text-red-800'       // Expired
    case 3: return 'bg-gray-100 text-gray-800'     // Suspended
    default: return 'bg-gray-100 text-gray-800'
  }
}