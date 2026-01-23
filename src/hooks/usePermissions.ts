import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Permissions = {
    can_sell: boolean;
    can_manage_products: boolean;
    can_view_reports: boolean;
    can_manage_settings: boolean;
    is_owner: boolean;
    loading: boolean;
};

export function usePermissions() {
    const [permissions, setPermissions] = useState<Permissions>({
        can_sell: false, // Default restrictive
        can_manage_products: false,
        can_view_reports: false,
        can_manage_settings: false,
        is_owner: false,
        loading: true
    });
    const supabase = createClient();

    useEffect(() => {
        checkPermissions();
    }, []);

    async function checkPermissions() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setPermissions(p => ({ ...p, loading: false }));
                return;
            }

            // Check if I am an employee
            // We select active just in case
            const { data: employee, error } = await supabase
                .from('employees')
                .select('permissions, role, active')
                .eq('auth_id', user.id)
                .single();

            if (employee && employee.active) {
                setPermissions({
                    can_sell: employee.permissions?.can_sell ?? false,
                    can_manage_products: employee.permissions?.can_manage_products ?? false,
                    can_view_reports: employee.permissions?.can_view_reports ?? false,
                    can_manage_settings: employee.permissions?.can_manage_settings ?? false,
                    is_owner: false,
                    loading: false
                });
            } else {
                // If not found in employees table, assume it's the Owner
                // (Or an unlinked user - but in this app logic, users are owners by default if they signed up independently)
                setPermissions({
                    can_sell: true,
                    can_manage_products: true,
                    can_view_reports: true,
                    can_manage_settings: true,
                    is_owner: true,
                    loading: false
                });
            }
        } catch (error) {
            console.error("Error checking permissions:", error);
            setPermissions(p => ({ ...p, loading: false }));
        }
    }

    return permissions;
}
