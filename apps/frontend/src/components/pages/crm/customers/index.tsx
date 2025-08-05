"use client";

import * as React from "react";
import {
  useCustomerKpi,
  useCustomers,
  useUnifiedSearch,
} from "@/hooks/useCustomers2";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Funnel,
  Plus,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import KpiCard from "./sections/kpi-card";
import EnhancedSearchInput from "./sections/enhanced-search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CustomerList } from "../../../../services/customers/types";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion";

// Define an interface for the highlighted customer results
interface HighlightedCustomer extends CustomerList {
  highlights?: {
    [key: string]: string[];
  };
}

const CRMCustomersList = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [openFilter, setOpenFilter] = React.useState("");

  // Fetch KPI data
  const { kpiData, loading: loadingKPI, error: errorKPI } = useCustomerKpi();

  // Standard customers hook for default view
  const {
    customers: defaultCustomers,
    loading: loadingDefault,
    error: errorDefault,
    pagination: defaultPagination,
    goToPage: defaultGoToPage,
    nextPage: defaultNextPage,
    prevPage: defaultPrevPage,
  } = useCustomers();

  // Unified search with pagination
  const {
    results: searchResults,
    highlightedResults,
    pagination: searchPagination,
    loading: searchLoading,
    error: searchError,
    query,
    isDebouncing,
    updateQuery,
    search,
    goToPage: searchGoToPage,
    nextPage: searchNextPage,
    prevPage: searchPrevPage,
    clearSearch,
  } = useUnifiedSearch({
    initialQuery: "",
    pageSize: 10,
    debounceMs: 300,
    autoSearch: true, // Search as you type
  });

  // Determine which data to display based on search state
  const customers = isSearchActive ? searchResults : defaultCustomers;
  const loading = isSearchActive ? searchLoading : loadingDefault;
  const error = isSearchActive ? searchError : errorDefault;
  const pagination = isSearchActive ? searchPagination : defaultPagination;
  const goToPage = isSearchActive ? searchGoToPage : defaultGoToPage;
  const nextPage = isSearchActive ? searchNextPage : defaultNextPage;
  const prevPage = isSearchActive ? searchPrevPage : defaultPrevPage;

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
    updateQuery(query);

    // Set search active state based on whether there's a query
    setIsSearchActive(!!query.trim());

    if (!query.trim()) {
      clearSearch();
    }
  };

  // Handle search submission (e.g., when Enter is pressed)
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearchActive(true);
      search(query);
    } else {
      setIsSearchActive(false);
      clearSearch();
    }
  };

  // Function to generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return null;

    const { currentPage, totalPages } = pagination;
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          className="text-xs text-gray-500 cursor-pointer"
          onClick={() => goToPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem
          key="ellipsis1"
          className="text-xs text-gray-500 cursor-pointer"
        >
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            className="text-xs text-gray-500 cursor-pointer"
            onClick={() => goToPage(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem
          key="ellipsis2"
          className="text-xs text-gray-500 cursor-pointer"
        >
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if it exists
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            className="text-xs text-gray-500 cursor-pointer"
            onClick={() => goToPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Function to render highlighted text
  const renderHighlight = (text: string, field: string, customerId: number) => {
    if (!isSearchActive) return text;

    // Cast highlightedResults to the correct type with highlights property
    const customer = highlightedResults?.find(
      (r) => r.pk_customer_id === customerId
    ) as HighlightedCustomer | undefined;
    if (!customer?.highlights?.[field]) return text;

    const highlight = customer.highlights[field][0];
    if (!highlight) return text;

    // Replace <em> tags with spans for styling
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: highlight
            .replace(/<em>/g, '<span class="bg-yellow-100 text-yellow-800">')
            .replace(/<\/em>/g, "</span>"),
        }}
      />
    );
  };

  return (
    <div 
      className="space-y-6"
      style={{ 
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      {/* KPI Cards */}
      {loadingKPI ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Customers"
            value={kpiData?.totalCustomers?.value || 0}
            percentage={kpiData?.totalCustomers?.percentage || 0}
            icon={Users}
          />
          <KpiCard
            title="Active Customers"
            value={kpiData?.activeCustomers?.value || 0}
            percentage={kpiData?.activeCustomers?.percentage || 0}
            icon={UserCheck}
          />
          <KpiCard
            title="New This Month"
            value={kpiData?.newThisMonth?.value || 0}
            percentage={kpiData?.newThisMonth?.percentage || 0}
            icon={UserPlus}
          />
          <KpiCard
            title="Total Revenue"
            value={kpiData?.totalRevenue?.value || 0}
            percentage={kpiData?.totalRevenue?.percentage || 0}
            icon={DollarSign}
          />
        </div>
      )}

      {/* Search and Action Controls */}
      <div className="flex flex-row gap-2 mb-4">
        <div className="flex-1">
          <EnhancedSearchInput
            placeholder="Search customers..."
            onQueryChange={handleSearchChange}
            onSearch={handleSearch}
            initialValue={searchTerm}
            isLoading={isSearchActive && searchLoading}
            isDebouncing={isSearchActive && isDebouncing}
            searchAsYouType={true}
            clearOnEmpty={true}
          />
        </div>

        <Button
          variant="outline"
          className="cursor-pointer border-gray-200 hover:bg-gray-50"
          style={{
            height: '36px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={() =>
            setOpenFilter((prevState) => (prevState === "1" ? "" : "1"))
          }
        >
          <Funnel className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>

        <Button
          className="cursor-pointer text-white"
          style={{
            backgroundColor: '#67A3F0',
            height: '36px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid #67A3F0'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(103, 163, 240, 0.81)';
            e.currentTarget.style.borderColor = 'rgba(103, 163, 240, 0.81)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#67A3F0';
            e.currentTarget.style.borderColor = '#67A3F0';
          }}
          onClick={() => {
            router.push("/crm/customers/add");
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Add Customer</span>
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        value={openFilter}
        onValueChange={setOpenFilter}
      >
        <AccordionItem value="1">
          <AccordionTrigger className="hidden">{}</AccordionTrigger>
          <AccordionContent>(Filter Fields Here)</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Customer Results */}
      <Card 
        className="bg-white border border-gray-200 overflow-hidden"
        style={{
          borderRadius: '14px', // xl radius from design guide
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' // shadow-sm
        }}
      >
        <CardHeader 
          className="border-b border-gray-200"
          style={{ padding: '24px' }}
        >
          <CardTitle 
            className="flex items-center justify-between"
            style={{ 
              fontSize: '24px', // text-2xl
              fontWeight: '600',
              lineHeight: '1',
              margin: '0',
              color: '#000000' // brand black
            }}
          >
            <span>
              {isSearchActive
                ? `Search Results for "${searchTerm}"`
                : "Customer Directory"}
            </span>
            {pagination && (
              <span 
                className="text-sm"
                style={{ color: '#6C757D' }} // brand muted gray
              >
                {pagination.totalItems} customer
                {pagination.totalItems !== 1 ? "s" : ""}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    paddingLeft: '24px',
                    fontWeight: '500',
                    color: '#6C757D', // brand muted gray
                    backgroundColor: '#F5F5F5' // muted background
                  }}
                >
                  Company
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Contact
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Contact Info
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Last Order
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Orders
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Total Spent
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Status
                </TableHead>
                <TableHead 
                  className="text-left border-b border-gray-200 invisible"
                  style={{ 
                    padding: '12px',
                    fontWeight: '500',
                    color: '#6C757D',
                    backgroundColor: '#F5F5F5'
                  }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {isSearchActive ? "Searching..." : "Loading customers..."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-red-500"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow 
                    key={customer.pk_customer_id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell
                      className="flex flex-col text-left"
                      style={{ 
                        rowGap: "5px", 
                        paddingLeft: "24px",
                        padding: '12px'
                      }}
                    >
                      <p className="text-sm">
                        {renderHighlight(
                          customer.name,
                          "name",
                          customer.pk_customer_id
                        )}
                      </p>
                      <p className="font-light text-gray-500 text-sm">{`C${customer.pk_customer_id}`}</p>
                    </TableCell>
                    <TableCell 
                      className="text-left text-sm"
                      style={{ padding: '12px' }}
                    >
                      {customer.primary_contact ? (
                        <>
                          {renderHighlight(
                            `${customer.primary_contact.first_name} ${customer.primary_contact.last_name}`,
                            "primary_contact.name",
                            customer.pk_customer_id
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell 
                      className="text-left text-sm"
                      style={{ padding: '12px' }}
                    >
                      <div>
                        {renderHighlight(
                          customer.email,
                          "email",
                          customer.pk_customer_id
                        )}
                      </div>
                      {customer.phone_number && (
                        <div>{customer.phone_number}</div>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-2 text-sm">
                      {customer.total_orders || 0}
                    </TableCell>
                    <TableCell className="p-2 text-sm">{`$${
                      (customer?.total_orders_spent || 0) < 0
                        ? 0
                        : customer?.total_orders_spent || 0
                    }`}</TableCell>
                    <TableCell className="p-2 text-sm">
                      {customer.status === "ACTIVE" ? (
                        <Badge className="bg-green-600 text-white text-xs font-light capitalize">
                          {customer.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-600 text-white text-xs font-light capitalize">
                          {customer.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-sm">
                      <Button
                        variant="ghost"
                        className="cursor-pointer hover:underline"
                        asChild
                      >
                        <Link
                          href={`/crm/customers/${customer.pk_customer_id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : isSearchActive ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No customers found matching "{searchTerm}". Try using
                    different keywords.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No customers found. Try changing your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {customers.length > 0 && pagination && (
            <div className="w-full flex flex-row justify-end border-t border-solid text-xs text-gray-500 p-4">
              showing {customers.length} of {pagination.totalItems || 0}{" "}
              customers
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-4 mb-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={`text-xs text-gray-500 p-4 ${
                        pagination.currentPage <= 1
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
                      }`}
                      onClick={() => pagination.currentPage > 1 && prevPage()}
                    />
                  </PaginationItem>
                  {generatePaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      className={`text-xs text-gray-500 p-4 ${
                        pagination.currentPage >= pagination.totalPages
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        pagination.currentPage < pagination.totalPages &&
                        nextPage()
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMCustomersList;
