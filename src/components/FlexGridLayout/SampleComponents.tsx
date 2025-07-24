
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ToolbarComponent = () => (
  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="outline">New</Button>
      <Button size="sm" variant="outline">Save</Button>
      <Button size="sm" variant="outline">Export</Button>
    </div>
    <div className="flex items-center space-x-2">
      <Input placeholder="Search..." className="w-48" />
      <Button size="sm">Search</Button>
    </div>
  </div>
);

export const SidebarComponent = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="ghost" className="w-full justify-start text-left">Dashboard</Button>
        <Button variant="ghost" className="w-full justify-start text-left">Projects</Button>
        <Button variant="ghost" className="w-full justify-start text-left">Reports</Button>
        <Button variant="ghost" className="w-full justify-start text-left">Settings</Button>
      </CardContent>
    </Card>
  </div>
);

export const MainContentComponent = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Main Content Area</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          This is the main content area where your primary content, grids, or dashboards would be displayed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <h3 className="font-medium mb-2">Item {i}</h3>
              <p className="text-sm text-gray-600">Sample content item</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const FormComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">Quick Form</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <Label htmlFor="name" className="text-sm">Name</Label>
        <Input id="name" placeholder="Enter name" />
      </div>
      <div>
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input id="email" type="email" placeholder="Enter email" />
      </div>
      <Button size="sm" className="w-full">Submit</Button>
    </CardContent>
  </Card>
);

export const FooterComponent = () => (
  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
    <div className="text-sm text-gray-600">
      Status: Ready | Items: 24 | Last updated: 5 min ago
    </div>
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="outline">Help</Button>
      <Button size="sm" variant="outline">Support</Button>
    </div>
  </div>
);
