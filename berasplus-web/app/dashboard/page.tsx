import TopKPIs from '@/components/Dashboard/TopKPIs'
import QuickActions from '@/components/Dashboard/QuickActions'
import SalesChart from '@/components/Dashboard/SalesChart'
import TargetRing from '@/components/Dashboard/TargetRing'
import InventoryWidget from '@/components/Dashboard/InventoryWidget'
import { StokMenipisWidget, ProdukTerlaris, SupplierIntelligence, MarginProduk, MixingHariIni } from '@/components/Dashboard/Lists'
import { AiAssistant, DeliveryWidget, ForecastWidget } from '@/components/Dashboard/ExtraWidgets'
import { RecentTransactions } from '@/components/Dashboard/Transactions'
import { getDashboardMetrics, getRecentTransactions, getChartData, getLowStockAlerts, getTopProducts, getTodayMixing, getInventoryOverview } from './actions'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let metrics = null
  let transactions: any[] = []
  let chartData: any[] = []
  let lowStockAlerts: any[] = []
  let topProducts: any[] = []
  let todayMixing: any[] = []
  let inventoryOverview: any = { rawMaterials: [], finishedGoods: [] }

  if (user) {
    const { data: userStore } = await supabase
      .from('user_stores')
      .select('store_id')
      .eq('user_id', user.id)
      .single()
      
    if (userStore) {
      metrics = await getDashboardMetrics(userStore.store_id)
      transactions = await getRecentTransactions(userStore.store_id)
      chartData = await getChartData(userStore.store_id)
      lowStockAlerts = await getLowStockAlerts(userStore.store_id)
      topProducts = await getTopProducts(userStore.store_id)
      todayMixing = await getTodayMixing(userStore.store_id)
      inventoryOverview = await getInventoryOverview(userStore.store_id)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 font-sans">Selamat datang kembali, Owner!</h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">Berikut ringkasan bisnis Lele Raya Mart hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2 outline-none">
            <option>Hari Ini, 23 Mei 2025</option>
          </select>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <span className="sr-only">Profile</span>
            O
          </div>
        </div>
      </div>

      {/* Row 1: Top KPIs */}
      <TopKPIs metrics={metrics} />

      {/* Row 2: Quick Actions */}
      <QuickActions />

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesChart data={chartData} />
        <TargetRing />
      </div>

      {/* Row 4: Inventory & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InventoryWidget rawMaterials={inventoryOverview.rawMaterials} finishedGoods={inventoryOverview.finishedGoods} />
        <StokMenipisWidget alerts={lowStockAlerts} />
      </div>

      {/* Row 5: Mini Lists (4 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProdukTerlaris topProducts={topProducts} />
        <SupplierIntelligence />
        <MarginProduk />
        <MixingHariIni todayMixing={todayMixing} />
      </div>

      {/* Row 6: AI, Delivery, Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 mb-4 h-[240px]">
            <h3 className="font-semibold text-slate-200 text-sm mb-4">Customer Insight</h3>
            {/* Customer insight static data */}
            <div className="flex justify-between text-center mb-6">
              <div><div className="text-lg font-bold text-emerald-400">18</div><div className="text-[9px] text-slate-400">Customer Baru</div></div>
              <div><div className="text-lg font-bold text-amber-400">52</div><div className="text-[9px] text-slate-400">Repeat Order</div></div>
              <div><div className="text-lg font-bold text-blue-400">34</div><div className="text-[9px] text-slate-400">Member</div></div>
              <div><div className="text-lg font-bold text-purple-400">8</div><div className="text-[9px] text-slate-400">Reseller</div></div>
            </div>
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">Top Customer</div>
              <div className="flex justify-between text-xs"><span className="text-slate-300"><span className="text-slate-500 mr-2">1</span>Pak Haji</span><span className="font-mono text-slate-400">480 Kg</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-300"><span className="text-slate-500 mr-2">2</span>Warung Padang</span><span className="font-mono text-slate-400">320 Kg</span></div>
            </div>
          </div>
          <button className="w-full py-2.5 text-xs font-medium text-slate-300 bg-slate-900 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">Lihat Semua Customer</button>
        </div>
        <AiAssistant />
        <DeliveryWidget />
        <ForecastWidget />
      </div>

      {/* Row 7: Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions} />
        </div>
        <div>
          {/* We already rendered Financial Snapshot in ForecastWidget to save space, but let's make sure layout looks good */}
        </div>
      </div>
    </div>
  )
}
