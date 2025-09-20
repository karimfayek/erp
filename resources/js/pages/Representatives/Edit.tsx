import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Link, useForm } from "@inertiajs/react";

import { can } from "@/utils/permissions";
export default function RepresentativesEdit( {representative , branches , customers} ) {
         
const handleUpdate = () => {
       put(route('representatives.update', repData.id),  {
           onSuccess: () => {   
               // Handle success
           }
       });
   }

   const { data:repData, setData:setRepData, put, reset:repReset } = useForm({
       name: representative.name,
       id: representative.id,
       phone: representative.phone,
       email: representative.email,
          customer_branch_id: representative.customer_branch_id,
            customer_id: representative.customer_id,
      });
   return (
          <AppLayout>
            <div className="p-6 ">
                <h1 className="text-2xl font-bold mb-4">تعديل المندوب</h1>
                <div className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">    
                    <Input
                        placeholder="Name"
                        value={repData.name}       
                        onChange={(e) => setRepData('name', e.target.value)}
                    />
                    <Input
                        placeholder="Phone"
                        value={repData.phone}
                        onChange={(e) => setRepData('phone', e.target.value)}
                    />
                    <Input
                        placeholder="Email"
                        value={repData.email}
                        onChange={(e) => setRepData('email', e.target.value)}
                    />
                     <Select
                        value={repData.customer_id?.toString() || ""}
                        onValueChange={(val) => setRepData('customer_id', Number(val))}
                    >
                        <SelectTrigger>
                             <SelectValue placeholder="تابع ل عميل /شركه/شخص" />
                        </SelectTrigger>
                        <SelectContent>
                                 <SelectItem value={""}>
                                {"تابع   ل عميل /شركه/شخص"}
                            </SelectItem>
                            {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={repData.customer_branch_id?.toString() || ""}
                        onValueChange={(val) => setRepData('customer_branch_id', Number(val))}
                    >
                        <SelectTrigger>
                             <SelectValue placeholder="تابع لفرع شركة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={""}>
                                {"تابع لفرع شركة"}
                                
                            </SelectItem>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                    {branch.name}- {branch.customer?.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className="col-span-2" onClick={handleUpdate} disabled={!repData.name || !repData.phone}>
                        Update
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}