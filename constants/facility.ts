export const BUILDING_STRUCTURE = [
    { id: 'Tòa A', name: 'Tòa A', floors: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4'] },
    { id: 'Tòa B', name: 'Tòa B', floors: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'] },
    { id: 'Khu vực chung', name: 'Khu vực chung', floors: ['Sân vườn', 'Nhà ăn', 'Hội trường', 'Cổng chính'] }
];

export const getFloorsForBuilding = (buildingId: string) => {
    return BUILDING_STRUCTURE.find(b => b.id === buildingId)?.floors || [];
};
